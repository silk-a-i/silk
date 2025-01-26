> NOTE this is a work in progress
> NOTE for best results use our `silk` provided models

Surgeon is a tool to do surgery on files. It can be used to replace text in files, add text to files, or remove text from files.

# Example response
```md
I'll help you change "Test" to "Hello World" in the title.

<silk.action tool="paste" path="index.html" start="8" end="12">Hello World</silk.action>

The title has been updated from "Test" to "Hello World".
```