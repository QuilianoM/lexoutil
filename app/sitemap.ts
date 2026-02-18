import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://lexoutil.fr";

  return [
    { url: baseUrl, priority: 1 },
    { url: `${baseUrl}/guides`, priority: 0.8 },
    { url: `${baseUrl}/documents`, priority: 0.8 },
    { url: `${baseUrl}/assistance`, priority: 0.7 },
    { url: `${baseUrl}/tarifs`, priority: 0.7 },
  ];
}
