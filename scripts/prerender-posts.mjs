#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "playwright";

const SITE_URL = "https://sites84.github.io/tem-gosto-do-que";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://saipuhuzotusqfihvjgw.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY || "sb_publishable_1LQ6Iy5AO8TB4JwtsdMokw_aWgFHHFc";
const ROOT = process.cwd();

async function getFoods() {
  const url = new URL(SUPABASE_URL + "/rest/v1/foods");
  url.searchParams.set("status", "eq.published");
  url.searchParams.set("select", "id,slug,name,summary,short_taste_answer,created_at,updated_at,main_image_url");
  url.searchParams.set("order", "updated_at.desc");
  const res = await fetch(url, { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY } });
  if (!res.ok) throw new Error("Falha ao buscar alimentos: " + res.status + " " + await res.text());
  const data = await res.json();
  if (!Array.isArray(data) || !data.length) throw new Error("Nenhum alimento publicado encontrado.");
  return data;
}

function esc(value) {
  return String(value || "").replace(/[&<>'"]/g, function(c) { return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]; });
}

function metaDescription(food) {
  const raw = String([food.short_taste_answer, food.summary].filter(Boolean).join(" ")).replace(/\s+/g, " ").trim();
  if (raw.length <= 158) return raw;
  const cut = raw.slice(0, 158);
  const last = cut.lastIndexOf(" ");
  return (last > 120 ? cut.slice(0, last) : cut).replace(/[.,;:!?-]+$/, "") + "…";
}

function sleep(ms) { return new Promise(function(resolve) { setTimeout(resolve, ms); }); }

async function prerenderFood(page, food) {
  const url = "http://127.0.0.1:4173/food.html?slug=" + encodeURIComponent(food.slug);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("#food-page .food-hero h1", { timeout: 60000 });
  await sleep(300);
  await page.evaluate(function(data) {
    const name = data.name;
    const description = data.description;
    const canonical = data.canonical;
    document.title = data.title;
    const setMeta = function(name, content) {
      let node = document.querySelector("meta[name=\"" + name + "\"]");
      if (!node) { node = document.createElement("meta"); node.setAttribute("name", name); document.head.appendChild(node); }
      node.setAttribute("content", content || "");
    };
    const setProp = function(property, content) {
      let node = document.querySelector("meta[property=\"" + property + "\"]");
      if (!node) { node = document.createElement("meta"); node.setAttribute("property", property); document.head.appendChild(node); }
      node.setAttribute("content", content || "");
    };
    setMeta("description", description);
    setMeta("robots", "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1");
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", data.title);
    setMeta("twitter:description", description);
    setProp("og:locale", "pt_BR");
    setProp("og:type", "article");
    setProp("og:site_name", "Tem Gosto do Q?");
    setProp("og:title", data.title);
    setProp("og:description", description);
    setProp("og:url", canonical);
    const hero = document.querySelector(".food-hero-cover");
    const imageUrl = hero ? hero.getAttribute("src") : "";
    const absoluteImage = imageUrl && !/^https?:\/\//i.test(imageUrl) ? data.site + "/" + imageUrl.replace(/^\.\//, "") : imageUrl;
    if (absoluteImage) {
      setProp("og:image", absoluteImage);
      setProp("og:image:alt", "Capa de " + name);
      setMeta("twitter:image", absoluteImage);
    }
    let canonicalNode = document.querySelector("link[rel=\"canonical\"]");
    if (!canonicalNode) { canonicalNode = document.createElement("link"); canonicalNode.setAttribute("rel", "canonical"); document.head.appendChild(canonicalNode); }
    canonicalNode.setAttribute("href", canonical);
    const oldJson = Array.from(document.querySelectorAll("script[type=\"application/ld+json\"]"));
    oldJson.forEach(function(node) { node.remove(); });
    const article = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": canonical + "#article",
      "headline": name,
      "description": description,
      "inLanguage": "pt-BR",
      "mainEntityOfPage": {"@type":"WebPage","@id":canonical},
      "url": canonical,
      "datePublished": data.created_at || undefined,
      "dateModified": data.updated_at || undefined,
      "author": {"@type":"Organization","name":"Tem Gosto do Q?","url":data.site},
      "publisher": {"@type":"Organization","name":"Tem Gosto do Q?","url":data.site}
    };
    if (absoluteImage) article.image = [absoluteImage];
    const articleScript = document.createElement("script");
    articleScript.type = "application/ld+json";
    articleScript.textContent = JSON.stringify(article);
    document.head.appendChild(articleScript);
    const breadcrumb = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Início","item":data.site + "/"},{"@type":"ListItem","position":2,"name":name,"item":canonical}]};
    const breadcrumbScript = document.createElement("script");
    breadcrumbScript.type = "application/ld+json";
    breadcrumbScript.textContent = JSON.stringify(breadcrumb);
    document.head.appendChild(breadcrumbScript);
    document.querySelectorAll("script[src]").forEach(function(node) { node.remove(); });
    document.querySelectorAll("link[rel=\"stylesheet\"]").forEach(function(node) {
      const href = node.getAttribute("href") || "";
      if (href === "styles.css" || href === "./styles.css") node.setAttribute("href", "../../styles.css");
      if (href === "food-fixes.css" || href === "./food-fixes.css") node.setAttribute("href", "../../food-fixes.css");
    });
    document.querySelectorAll("img").forEach(function(node) {
      const src = node.getAttribute("src") || "";
      if (src.startsWith("images/") || src.startsWith("./images/")) node.setAttribute("src", "../../" + src.replace(/^\.\//, ""));
    });
    document.querySelectorAll("a").forEach(function(node) {
      const href = node.getAttribute("href") || "";
      if (href === "./" || href === "") node.setAttribute("href", "../../");
      else if (href.startsWith("./#")) node.setAttribute("href", "../../" + href.slice(2));
      else if (href.startsWith("posts/")) node.setAttribute("href", "../" + href.slice(6));
      else if (href.startsWith("food.html?slug=")) {
        const oldSlug = new URL(href, location.href).searchParams.get("slug");
        if (oldSlug) node.setAttribute("href", "../" + oldSlug + "/");
      }
    });
  }, {
    name: food.name,
    title: dataTitle(food),
    description: metaDescription(food),
    canonical: SITE_URL + "/posts/" + encodeURIComponent(food.slug) + "/",
    site: SITE_URL,
    created_at: food.created_at,
    updated_at: food.updated_at
  });
  return await page.content();
}

function dataTitle(food) { return food.name + ": tem gosto de quê? | Tem Gosto do Q?"; }

function buildSitemap(foods) {
  const rows = ["<?xml version=\"1.0\" encoding=\"UTF-8\"?>", "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\">"];
  rows.push("<url><loc>" + SITE_URL + "/</loc></url>");
  foods.forEach(function(food) {
    const last = food.updated_at || food.created_at;
    const cover = "";
    rows.push("<url><loc>" + esc(SITE_URL + "/posts/" + encodeURIComponent(food.slug) + "/") + "</loc>" + (last ? "<lastmod>" + new Date(last).toISOString() + "</lastmod>" : "") + "</url>");
  });
  rows.push("</urlset>");
  return rows.join("\n");
}

function updateIndexSource(foods) {
  const file = path.join(ROOT, "index.html");
  let html = fs.readFileSync(file, "utf8");
  const links = foods.map(function(food) {
    return "<a class=\"directory-link\" href=\"posts/" + esc(food.slug) + "/\"><strong>" + esc(food.name) + "</strong><span>" + esc(food.short_taste_answer || food.summary || "Abrir investigação") + "</span><b aria-hidden=\"true\">↗</b></a>";
  }).join("");
  html = html.replace(/<!-- SEO_DIRECTORY_START -->[\\s\\S]*?<!-- SEO_DIRECTORY_END -->/, "<!-- SEO_DIRECTORY_START -->" + links + "<!-- SEO_DIRECTORY_END -->");
  fs.writeFileSync(file, html);
}

async function main() {
  const foods = await getFoods();
  updateIndexSource(foods);
  const server = spawn("python3", ["-m", "http.server", "4173", "-d", "."], { cwd: ROOT, stdio: "ignore" });
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    for (const food of foods) {
      const html = await prerenderFood(page, food);
      const dir = path.join(ROOT, "posts", food.slug);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, "index.html"), html);
      console.log("Gerado: posts/" + food.slug + "/index.html");
    }
  } finally {
    await browser.close();
    server.kill("SIGTERM");
  }
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(foods));
  fs.writeFileSync(path.join(ROOT, "robots.txt"), "User-agent: *\nAllow: /\n\nSitemap: " + SITE_URL + "/sitemap.xml\n");
  console.log("SEO prerender concluído: " + foods.length + " posts.");
}

main().catch(function(error) { console.error(error); process.exit(1); });