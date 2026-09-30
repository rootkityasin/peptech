import { defineRouteConfig } from "@medusajs/admin-sdk";
import { adminFetch as fetch } from "../../../../lib/sdk";
import "../../../../styles/custom.css";
import { Container, Heading, Text, Button, Input, Label, Badge, Table, Drawer, toast } from "@medusajs/ui";
import { useState, useEffect } from "react";

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

const DEFAULT_PACKAGING_PROFILES: PackagingProfile[] = [
  {
    id: "pen-set",
    name: "Complete Pen Set Box",
    packageFormatIdentifier: "smallParcel",
    packageFormatLabel: "Small Parcel",
    weightInGrams: 240,
    dimensions: { heightInMms: 80, widthInMms: 160, depthInMms: 220 },
    isSystem: true,
  },
  {
    id: "vials-letter",
    name: "Freeze-Dried Vials Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 95,
    dimensions: { heightInMms: 24, widthInMms: 125, depthInMms: 185 },
    isSystem: true,
  },
  {
    id: "refill-letter",
    name: "Refill Cartridge Box",
    packageFormatIdentifier: "largeLetter",
    packageFormatLabel: "Large Letter",
    weightInGrams: 110,
    dimensions: { heightInMms: 25, widthInMms: 120, depthInMms: 160 },
    isSystem: true,
  },
  {
    id: "multi-parcel",
    name: "Multi-Item / Cold-Chain Kit",
    packageFormatIdentifier: "mediumParcel",
    packageFormatLabel: "Medium Parcel",
    weightInGrams: 520,
    dimensions: { heightInMms: 140, widthInMms: 220, depthInMms: 300 },
    isSystem: true,
  },
];

const PackagingProfilesPage = () => {
  const [profiles, setProfiles] = useState<PackagingProfile[]>(DEFAULT_PACKAGING_PROFILES);
  const [isLoading, setIsLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [packageFormat, setPackageFormat] = useState("smallParcel");
  const [weight, setWeight] = useState(240);
  const [h, setH] = useState(80);
  const [w, setW] = useState(160);
  const [d, setD] = useState(220);
  const [isSaving, setIsSaving] = useState(false);

  const loadProfiles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/admin/custom/packaging-profiles", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.profiles) && data.profiles.length > 0) {
          setProfiles(data.profiles);
          try {
            localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles));
          } catch {}
          return;
        }
      }
    } catch {}
    try {
      const local = localStorage.getItem("peptech_packaging_profiles");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed) && parsed.length > 0) setProfiles(parsed);
      }
    } catch {}
    setIsLoading(false);
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setPackageFormat("smallParcel");
    setWeight(240);
    setH(80);
    setW(160);
    setD(220);
    setIsDrawerOpen(true);
  };

  const startEdit = (p: PackagingProfile) => {
    setEditingId(p.id);
    setName(p.name);
    setPackageFormat(p.packageFormatIdentifier);
    setWeight(p.weightInGrams);
    setH(p.dimensions?.heightInMms || 80);
    setW(p.dimensions?.widthInMms || 160);
    setD(p.dimensions?.depthInMms || 220);
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingId(null);
    setName("");
    setPackageFormat("smallParcel");
    setWeight(240);
    setH(80);
    setW(160);
    setD(220);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Validation Error", { description: "Please enter a profile name." });
      return;
    }
    setIsSaving(true);

    try {
      const payload: any = {
        name: name.trim(),
        packageFormatIdentifier: packageFormat,
        weightInGrams: Number(weight) || 240,
        dimensions: {
          heightInMms: Number(h) || 80,
          widthInMms: Number(w) || 160,
          depthInMms: Number(d) || 220,
        },
      };

      if (editingId) {
        payload.id = editingId;
      }

      const res = await fetch("/admin/custom/packaging-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save packaging profile.");
      }

      if (Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try {
          localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles));
        } catch {}
      }

      toast.success(editingId ? "Profile Updated" : "Profile Created", {
        description: `Successfully saved "${name.trim()}".`,
      });
      closeDrawer();
    } catch (err: any) {
      toast.error("Error Saving Profile", {
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (id: string, profileName: string) => {
    if (!confirm(`Are you sure you want to delete the packaging profile "${profileName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/admin/custom/packaging-profiles?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to delete packaging profile.");
      }

      if (Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try {
          localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles));
        } catch {}
      }
      if (editingId === id) {
        closeDrawer();
      }
      toast.success("Profile Deleted", {
        description: `Deleted "${profileName}".`,
      });
    } catch (err: any) {
      toast.error("Error Deleting Profile", {
        description: err.message || "Could not delete profile.",
      });
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset packaging profiles back to PEPTECH standard factory defaults?")) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/admin/custom/packaging-profiles?action=reset`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.profiles)) {
        setProfiles(data.profiles);
        try {
          localStorage.setItem("peptech_packaging_profiles", JSON.stringify(data.profiles));
        } catch {}
        closeDrawer();
        toast.success("Profiles Reset", {
          description: "Packaging profiles reset to standard factory defaults.",
        });
      }
    } catch (err: any) {
      toast.error("Reset Failed", {
        description: err.message || "Failed to reset profiles.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <Container className="divide-y p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <Heading>Packaging Profiles</Heading>
            <Text className="text-ui-fg-subtle" size="small">
              Configure reusable box dimensions, gross weight presets, and Royal Mail formats
            </Text>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              size="small"
              variant="secondary"
              onClick={handleResetDefaults}
              disabled={isLoading}
            >
              Reset to Defaults
            </Button>
            <Button
              size="small"
              variant="secondary"
              onClick={loadProfiles}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={openCreate}
            >
              Create
            </Button>
          </div>
        </div>

        {/* Existing Profiles Table */}
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Package Format</Table.HeaderCell>
              <Table.HeaderCell>Gross Weight</Table.HeaderCell>
              <Table.HeaderCell>Dimensions (H × W × D)</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {profiles.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell className="font-medium text-ui-fg-base">
                  {p.name}
                </Table.Cell>
                <Table.Cell>
                  <Badge color="blue" size="2xsmall">
                    {p.packageFormatLabel || p.packageFormatIdentifier}
                  </Badge>
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {p.weightInGrams} g
                </Table.Cell>
                <Table.Cell className="text-ui-fg-subtle">
                  {p.dimensions.heightInMms} × {p.dimensions.widthInMms} × {p.dimensions.depthInMms} mm
                </Table.Cell>
                <Table.Cell>
                  {p.isSystem ? (
                    <Badge color="grey" size="2xsmall">
                      Default Preset
                    </Badge>
                  ) : (
                    <Badge color="green" size="2xsmall">
                      Custom
                    </Badge>
                  )}
                </Table.Cell>
                <Table.Cell className="text-right">
                  <div className="flex items-center justify-end gap-x-2">
                    <Button
                      size="small"
                      variant="secondary"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      className="text-ui-fg-error hover:text-ui-fg-error"
                      onClick={() => handleDeleteProfile(p.id, p.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>

      {/* Create / Edit Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Drawer.Content className="flex flex-col">
          <Drawer.Header>
            <Drawer.Title asChild>
              <Heading>
                {editingId ? "Edit Packaging Profile" : "Create Packaging Profile"}
              </Heading>
            </Drawer.Title>
            <Drawer.Description asChild>
              <Text className="text-ui-fg-subtle" size="small">
                {editingId
                  ? "Update preset dimensions, packaging format, and gross weight."
                  : "Add a custom packaging specification for Royal Mail fulfillment."}
              </Text>
            </Drawer.Description>
          </Drawer.Header>

          <form onSubmit={handleSaveProfile} className="flex flex-1 flex-col justify-between overflow-y-auto">
            <Drawer.Body className="flex flex-1 flex-col gap-y-4 p-6 overflow-y-auto">
              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Profile Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 5x Vial Cold Pack Mailer"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Royal Mail Package Format
                </Label>
                <select
                  value={packageFormat}
                  onChange={(e) => setPackageFormat(e.target.value)}
                  className="w-full h-8 px-2 text-xs rounded-md border border-ui-border-base bg-ui-bg-field text-ui-fg-base focus:border-ui-border-interactive focus:outline-none"
                >
                  <option value="smallParcel">Small Parcel (Cold-Chain Box)</option>
                  <option value="largeLetter">Large Letter (Vial Box)</option>
                  <option value="mediumParcel">Medium Parcel</option>
                  <option value="parcel">Parcel</option>
                  <option value="largeParcel">Large Parcel</option>
                </select>
              </div>

              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Gross Weight (grams)
                </Label>
                <Input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  placeholder="240"
                  required
                />
              </div>

              <div className="flex flex-col gap-y-2">
                <Label weight="plus" size="small">
                  Outer Dimensions (H × W × D mm)
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Height (H)</span>
                    <Input
                      type="number"
                      value={h}
                      onChange={(e) => setH(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="80"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Width (W)</span>
                    <Input
                      type="number"
                      value={w}
                      onChange={(e) => setW(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="160"
                      required
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-ui-fg-muted mb-1 block">Depth (D)</span>
                    <Input
                      type="number"
                      value={d}
                      onChange={(e) => setD(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      placeholder="220"
                      required
                    />
                  </div>
                </div>
              </div>
            </Drawer.Body>

            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button variant="secondary" size="small" type="button">
                  Cancel
                </Button>
              </Drawer.Close>
              <Button
                variant="primary"
                size="small"
                type="submit"
                isLoading={isSaving}
                disabled={isSaving || !name.trim()}
              >
                {editingId ? "Save Changes" : "Create Profile"}
              </Button>
            </Drawer.Footer>
          </form>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}

export default PackagingProfilesPage

export const config = defineRouteConfig({
  label: "Packaging Profiles",
});
