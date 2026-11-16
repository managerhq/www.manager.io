import typography from "@tailwindcss/typography";

export default {
  // The built pages contain every class in use, including those inside guide content.
  content: ["./_site/**/*.html", "./public/js/**/*.js"],
  darkMode: "class",
  plugins: [typography],
};
