"use client";

import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    productName: "",
    category: "",
    features: "",
    platform: "wildberries",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // userId пока не передаём — добавьте после подключения авторизации
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Что-то пошло не так");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <section style={styles.hero}>
        <h1 style={styles.h1}>Карточки товаров за 10 секунд</h1>
        <p style={styles.subtitle}>
          AI генерирует заголовок, описание и ключевые слова под требования
          Wildberries, Ozon и Avito
        </p>
      </section>

      <section style={styles.formSection}>
        <form onSubmit={handleGenerate} style={styles.form}>
          <label style={styles.label}>
            Название товара *
            <input
              style={styles.input}
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              placeholder="Например: Термокружка с крышкой 500мл"
              required
            />
          </label>

          <label style={styles.label}>
            Категория
            <input
              style={styles.input}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Например: Посуда для напитков"
            />
          </label>

          <label style={styles.label}>
            Характеристики / особенности
            <textarea
              style={{ ...styles.input, minHeight: 90 }}
              value={form.features}
              onChange={(e) => setForm({ ...form, features: e.target.value })}
              placeholder="Например: нержавеющая сталь, держит тепло 12 часов, не течёт, 3 цвета"
            />
          </label>

          <label style={styles.label}>
            Площадка
            <select
              style={styles.input}
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              <option value="wildberries">Wildberries</option>
              <option value="ozon">Ozon</option>
              <option value="avito">Avito</option>
            </select>
          </label>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Генерируем..." : "Сгенерировать карточку"}
          </button>

          {error && <p style={styles.error}>{error}</p>}
        </form>

        {result && (
          <div style={styles.result}>
            <h2 style={styles.resultTitle}>{result.title}</h2>
            <ul>
              {result.bullets?.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <p style={{ whiteSpace: "pre-wrap" }}>{result.description}</p>
            <p style={styles.keywords}>
              <strong>Ключевые слова:</strong> {result.keywords?.join(", ")}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  main: { maxWidth: 720, margin: "0 auto", padding: "40px 20px" },
  hero: { textAlign: "center", marginBottom: 40 },
  h1: { fontSize: 32, marginBottom: 8 },
  subtitle: { color: "#555", fontSize: 16 },
  formSection: { display: "flex", flexDirection: "column", gap: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 14, fontWeight: 600 },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    fontSize: 15,
    fontFamily: "inherit",
  },
  button: {
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "#111",
    color: "#fff",
    fontSize: 16,
    cursor: "pointer",
  },
  error: { color: "#c0392b" },
  result: {
    border: "1px solid #eee",
    borderRadius: 12,
    padding: 24,
    background: "#fafafa",
  },
  resultTitle: { marginTop: 0 },
  keywords: { fontSize: 14, color: "#555" },
};
