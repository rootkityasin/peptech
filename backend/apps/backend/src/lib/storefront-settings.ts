import * as fs from "fs";
import * as path from "path";

export interface StorefrontSettings {
  show_lab_quality_section: boolean;
  updated_at?: string;
  updated_by?: string;
}

export const DEFAULT_STOREFRONT_SETTINGS: StorefrontSettings = {
  show_lab_quality_section: true,
};

function getWorkspaceDataDir(): string {
  // Find project root by looking for package.json with name "peptech"
  let dir = __dirname;
  while (true) {
    const pkg = path.join(dir, "package.json");
    if (fs.existsSync(pkg)) {
      try {
        const p = JSON.parse(fs.readFileSync(pkg, "utf8"));
        if (p.name === "peptech") return path.join(dir, "data");
      } catch {}
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(process.cwd(), "../../../data");
}

const DATA_DIR = getWorkspaceDataDir();
const DATA_FILE = path.join(DATA_DIR, "storefront-settings.json");

export function readStorefrontSettings(): StorefrontSettings {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_STOREFRONT_SETTINGS, null, 2), "utf8");
      return DEFAULT_STOREFRONT_SETTINGS;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STOREFRONT_SETTINGS,
      ...parsed,
    };
  } catch (err) {
    console.error("[Storefront Settings] Error reading settings file:", err);
    return DEFAULT_STOREFRONT_SETTINGS;
  }
}

export function writeStorefrontSettings(settings: StorefrontSettings): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 2), "utf8");
  } catch (err) {
    console.error("[Storefront Settings] Error writing settings file:", err);
  }
}
