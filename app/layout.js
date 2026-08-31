export const metadata = {
  title: "WB AI — генератор карточек товаров",
  description: "AI-генератор описаний товаров для Wildberries, Ozon и Avito",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
