const themeStorageKey = "english2hindi_theme";
const themeToggleButtonId = "themeToggleBtn";

function getPreferredTheme() {
	const savedTheme = localStorage.getItem(themeStorageKey);
	if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
	document.documentElement.dataset.theme = theme;
	const themeToggleBtn = document.getElementById(themeToggleButtonId);
	if (themeToggleBtn) {
		themeToggleBtn.textContent = theme === "dark" ? "Light Theme" : "Dark Theme";
		themeToggleBtn.setAttribute("aria-pressed", String(theme === "dark"));
	}
}

applyTheme(getPreferredTheme());

document.addEventListener("DOMContentLoaded", () => {
	const themeToggleBtn = document.getElementById(themeToggleButtonId);
	if (!themeToggleBtn) return;

	applyTheme(getPreferredTheme());
	themeToggleBtn.addEventListener("click", () => {
		const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
		localStorage.setItem(themeStorageKey, nextTheme);
		applyTheme(nextTheme);
	});
});
