import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import * as fs from "fs";
import * as path from "path";

export interface PackagingProfile {
  id: string;
  name: string;
  packageFormatIdentifier: string;
  packageFormatLabel?: string;
  weightInGrams: number;
  dimensions: {
    heightInMms: number;
    widthInMms: number;
    depthInMms: number;
  };
  isSystem?: boolean;
  createdAt?: string;
}

export const DEFAULT_PACKAGING_PROFILES: PackagingProfile[] = [
  {
    id: "pen-set",
    name: "Complete Pen Set Box",
    packageFormatIdentifier: "smallParcel",
    packageFormatLabel: "Small Parcel",
    weightInGrams: 240,
    dimensions: {
      heightInMms: 80,
      widthInMms: 160,
      depthInMms: 220,
    },
    isSystem: true,
  },
  {
    id: "vials-letter",
    name: "Freeze-Dried Vials Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 95,
    dimensions: {
      heightInMms: 24,
      widthInMms: 125,
      depthInMms: 185,
    },
    isSystem: true,
  },
  {
    id: "refill-letter",
    name: "Refill Cartridge Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 110,
    dimensions: {
      heightInMms: 25,
      widthInMms: 120,
      depthInMms: 160,
    },
    isSystem: true,
  },
  {
    id: "multi-parcel",
    name: "Multi-Item / Cold-Chain Kit",
    packageFormatIdentifier: "mediumParcel",
    packageFormatLabel: "Medium Parcel",
    weightInGrams: 520,
    dimensions: {
      heightInMms: 140,
      widthInMms: 220,
      depthInMms: 300,
    },
    isSystem: true,
  },
];

const DATA_DIR = path.resolve(process.cwd(), "data");
const DATA_FILE = path.resolve(DATA_DIR, "packaging-profiles.json");

function ensureDataFile(): PackagingProfile[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(DEFAULT_PACKAGING_PROFILES, null, 2), "utf8");
      return DEFAULT_PACKAGING_PROFILES;
    }
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PACKAGING_PROFILES;
  } catch (err) {
    console.error("[Packaging Profiles] Error reading profiles file:", err);
    return DEFAULT_PACKAGING_PROFILES;
  }
}

function saveDataFile(profiles: PackagingProfile[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(profiles, null, 2), "utf8");
  } catch (err) {
    console.error("[Packaging Profiles] Error writing profiles file:", err);
  }
}

// GET /admin/custom/packaging-profiles - Retrieve all packaging profiles
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const profiles = ensureDataFile();
    return res.status(200).json({ profiles });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to load packaging profiles" });
  }
}

// POST /admin/custom/packaging-profiles - Create or update a packaging profile
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id, name, packageFormatIdentifier, weightInGrams, dimensions } = req.body as any;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ message: "Profile name is required." });
    }

    const currentProfiles = ensureDataFile();

    // If existing ID is provided, UPDATE in place
    if (id) {
      const idx = currentProfiles.findIndex((p) => p.id === id);
      if (idx >= 0) {
        const updatedProfile: PackagingProfile = {
          ...currentProfiles[idx],
          name: name.trim(),
          packageFormatIdentifier: packageFormatIdentifier || currentProfiles[idx].packageFormatIdentifier,
          weightInGrams: Math.max(1, Number(weightInGrams) || currentProfiles[idx].weightInGrams),
          dimensions: {
            heightInMms: Math.max(1, Number(dimensions?.heightInMms) || currentProfiles[idx].dimensions.heightInMms),
            widthInMms: Math.max(1, Number(dimensions?.widthInMms) || currentProfiles[idx].dimensions.widthInMms),
            depthInMms: Math.max(1, Number(dimensions?.depthInMms) || currentProfiles[idx].dimensions.depthInMms),
          },
        };
        currentProfiles[idx] = updatedProfile;
        saveDataFile(currentProfiles);
        return res.status(200).json({ success: true, profile: updatedProfile, profiles: currentProfiles });
      }
    }

    // Otherwise CREATE new profile
    const newId = "pkg-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6);
    const newProfile: PackagingProfile = {
      id: newId,
      name: name.trim(),
      packageFormatIdentifier: packageFormatIdentifier || "smallParcel",
      weightInGrams: Math.max(1, Number(weightInGrams) || 240),
      dimensions: {
        heightInMms: Math.max(1, Number(dimensions?.heightInMms) || 80),
        widthInMms: Math.max(1, Number(dimensions?.widthInMms) || 160),
        depthInMms: Math.max(1, Number(dimensions?.depthInMms) || 220),
      },
      isSystem: false,
      createdAt: new Date().toISOString(),
    };

    const updated = [...currentProfiles, newProfile];
    saveDataFile(updated);

    return res.status(201).json({ success: true, profile: newProfile, profiles: updated });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to save packaging profile" });
  }
}

// DELETE /admin/custom/packaging-profiles - Delete a packaging profile or reset to defaults
export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  try {
    const action = req.query?.action as string;
    if (action === "reset") {
      saveDataFile(DEFAULT_PACKAGING_PROFILES);
      return res.status(200).json({ success: true, profiles: DEFAULT_PACKAGING_PROFILES });
    }

    const id = (req.query?.id || (req.body as any)?.id) as string;
    if (!id) {
      return res.status(400).json({ message: "Profile ID is required for deletion." });
    }

    const currentProfiles = ensureDataFile();
    const updated = currentProfiles.filter((p) => p.id !== id);

    // Keep at least one profile if all were deleted
    const finalProfiles = updated.length > 0 ? updated : DEFAULT_PACKAGING_PROFILES;
    saveDataFile(finalProfiles);

    return res.status(200).json({ success: true, profiles: finalProfiles });
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Failed to delete packaging profile" });
  }
}
