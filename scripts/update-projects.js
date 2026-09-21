const fs = require("fs");

const username = "shashwatmauryabtech23-27-pixel";
const startMarker = "<!-- REPOSITORIES:START -->";
const endMarker = "<!-- REPOSITORIES:END -->";

async function main() {
  const response = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "profile-readme-updater",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  const repos = (await response.json())
    .filter(
      (repo) =>
        !repo.fork &&
        !repo.private &&
        repo.name.toLowerCase() !== username.toLowerCase()
    )
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  const rows = repos.length
    ? repos
        .map((repo) => {
          const description = (repo.description || "Explore the source code and project details.")
            .replace(/\|/g, "\\|")
            .replace(/\r?\n/g, " ");
          const language = repo.language || "Multiple";
          return `| [**${repo.name}**](${repo.html_url}) | ${description} | ${language} | ⭐ ${repo.stargazers_count} |`;
        })
        .join("\n")
    : "| No public repositories found | — | — | — |";

  const block = `${startMarker}
| Repository | Description | Primary language | Stars |
|---|---|---|---|
${rows}
${endMarker}`;

  const readmePath = "README.md";
  const readme = fs.readFileSync(readmePath, "utf8");
  const pattern = new RegExp(
    `${startMarker}[\\s\\S]*?${endMarker}`
  );

  if (!pattern.test(readme)) {
    throw new Error("Repository markers were not found in README.md");
  }

  fs.writeFileSync(readmePath, readme.replace(pattern, block));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
