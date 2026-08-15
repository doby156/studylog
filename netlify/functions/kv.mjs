[build]
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/"
  to = "/study-log.html"
  status = 200
