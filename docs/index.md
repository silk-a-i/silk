---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Silk CLI"
  text: "A powerful CLI tool for quick task automation using LLMs."
  tagline: "Automate your tasks with ease"
  actions:
    - theme: brand
      text: Plugins
      link: /plugins
    - theme: alt
      text: API Examples
      link: /api

# features:
#   - title: Feature A
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature B
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
#   - title: Feature C
#     details: Lorem ipsum dolor sit amet, consectetur adipiscing elit
---

```sh
# New project
silk create website "Build a simple html website"
silk create snake "Create a snake game in html"

# In an existing project
silk do "make a README.md of this project"
```
