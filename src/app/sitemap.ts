import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://typefighter.onrender.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://typefighter.onrender.com/solo",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}