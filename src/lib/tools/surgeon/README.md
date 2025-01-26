Surgeon is an action to do surgery on files. It can be used to replace text in files, add text to files, or remove text from files.

> NOTE this is a work in progress

# Requirements
- the `silk` api

# Usage
```sh
silk do "use surgeon to change the title"
silk do "use surgeon to remove the header"
silk do "use surgeon to remove the footer"
silk do "use surgeon to remove the header and the footer"
```

# Example response
```md
I'll help you change "Test" to "Hello World" in the title.

<silk.action tool="paste" path="index.html" start="8:1" end="12:5">Hello World</silk.action>

The title has been updated from "Test" to "Hello World".
```