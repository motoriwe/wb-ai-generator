import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdmin } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { productName, category, features, platform, userId } = await req.json();

    if (!productName) {
      return Response.json({ error: "Укажите название товара" }, { status: 400 });
    }

    // --- Проверка лимитов пользователя (пропустите, если делаете MVP без авторизации) ---
    if (userId) {
      const supabaseAdmin = getSupabaseAdmin();
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("generations_used, generations_limit, subscription_status")
        .eq("id", userId)
        .single();

      if (profile) {
        const isSubscribed = profile.subscription_status === "active";
        if (!isSubscribed && profile.generations_used >= profile.generations_limit) {
          return Response.json(
            { error: "Лимит бесплатных генераций исчерпан. Оформите подписку." },
            { status: 403 }
          );
        }
      }
    }

    // --- Промпт под задачу: карточка товара для маркетплейса ---
    const platformRules = {
      wildberries:
        "Заголовок до 60 символов. 3-5 буллитов с ключевыми характеристиками. Описание до 1000 символов, с ключевыми словами для поиска WB, но без переспама.",
      ozon:
        "Заголовок до 250 символов, но лаконичный. Описание структурированное, с подзаголовками при необходимости, до 6000 символов.",
      avito:
        "Заголовок цепляющий, до 50 символов. Описание живое, разговорное, с призывом к действию в конце, до 3000 символов.",
    };

    const rules = platformRules[platform] || platformRules.wildberries;

    const prompt = `Ты — опытный копирайтер маркетплейсов. Составь продающую карточку товара.

Товар: ${productName}
Категория: ${category || "не указана"}
Характеристики/особенности: ${features || "не указаны"}
Площадка: ${platform || "wildberries"}

Правила площадки: ${rules}

Верни ответ СТРОГО в формате JSON без markdown-разметки и без пояснений:
{
  "title": "заголовок товара",
  "bullets": ["буллит 1", "буллит 2", "буллит 3"],
  "description": "полное описание товара",
  "keywords": ["ключевое слово 1", "ключевое слово 2", "..."]
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    const cleaned = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleaned);

    // --- Обновление счётчика использованных генераций ---
    if (userId) {
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.rpc("increment_generations", { user_id: userId }).catch(() => {
        // Если RPC-функция не создана, просто пропускаем — не должно ронять запрос
      });
    }

    return Response.json({ result });
  } catch (err) {
    console.error("Generate error:", err);
    return Response.json({ error: "Ошибка генерации. Попробуйте ещё раз." }, { status: 500 });
  }
}
