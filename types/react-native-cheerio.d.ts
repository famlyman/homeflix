declare module "react-native-cheerio" {
    import { CheerioAPI } from "cheerio"; // Use cheerio's types as a base
    export function load(html: string | Buffer, options?: any): CheerioAPI;
  }