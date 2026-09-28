import { Container, Heading, Text, Button, Input, Label, Badge, Table } from "@medusajs/ui";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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

export default function PackagingProfilesPage() {
  const [profiles, setProfiles] = useState<PackagingProfile[]>(DEFAULT_PACKAGING_PROFILES);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Editing state: null means creating new, string means editing existing profile id
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

  const startEdit = (p: PackagingProfile) => {
    setEditingId(p.id);
    setName(p.name);
    setPackageFormat(p.packageFormatIdentifier);
    setWeight(p.weightInGrams);
    setH(p.dimensions.heightInMms);
    setW(p.dimensions.widthInMms);
    setD(p.dimensions.depthInMms);
    setMessage(`Editing "${p.name}". Update the fields below and click "Update Packaging Profile".`);
    setErrorMsg("");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPackageFormat("smallParcel");
    setWeight(240);
    setH(80);
    setW(160);
    setD(220);
    setMessage("");
    setErrorMsg("");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Please enter a profile name.");
      return;
    }
    setIsSaving(true);
    setErrorMsg("");
    setMessage("");

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

      setMessage(editingId ? `Successfully updated "${name.trim()}".` : `Successfully created "${name.trim()}".`);
      cancelEdit();
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred.");
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
        cancelEdit();
      }
      setMessage(`Deleted "${profileName}".`);
    } catch (err: any) {
      setErrorMsg(err.message || "Could not delete profile.");
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
        cancelEdit();
        setMessage("Packaging profiles reset to standard defaults.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto p-4">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-ui-fg-muted flex items-center gap-1.5">
          <Link to="/settings" className="hover:underline text-ui-fg-subtle">Settings</Link>
          <span>/</span>
          <Link to="/settings/locations" className="hover:underline text-ui-fg-subtle">Locations & Shipping</Link>
          <span>/</span>
          <span className="text-ui-fg-base font-semibold">Packaging Profiles</span>
        </div>
        <Link
          to="/settings/locations"
          className="text-xs text-ui-fg-interactive hover:underline inline-flex items-center gap-1 font-medium"
        >
          ← Back to Locations & Shipping
        </Link>
      </div>

      <Container className="divide-y p-0">
        {/* Header */}
        <div className="flex flex-col gap-2 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                <Heading level="h1" className="text-xl font-bold text-ui-fg-base">
                  Packaging Profiles
                </Heading>
              </div>
              <Text className="text-ui-fg-subtle text-sm mt-1">
                Configure reusable box dimensions, gross weight presets, and Royal Mail formats under Locations & Shipping.
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Button size="small" variant="secondary" onClick={handleResetDefaults} disabled={isLoading}>
                ↺ Reset to Defaults
              </Button>
              <Button size="small" variant="secondary" onClick={loadProfiles} disabled={isLoading}>
                ↻ Refresh
              </Button>
            </div>
          </div>
          {message && <div className="p-3 bg-green-50 border border-green-200 text-green-800 text-xs rounded-md">{message}</div>}
          {errorMsg && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">{errorMsg}</div>}
        </div>

        {/* Existing Profiles Table */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
              Active Packaging Profiles ({profiles.length})
            </Heading>
            <span className="text-xs text-ui-fg-muted">
              Auto-fills fulfillment weight and box dimensions on order dispatch.
            </span>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Profile Name</Table.HeaderCell>
                  <Table.HeaderCell>Package Format</Table.HeaderCell>
                  <Table.HeaderCell>Gross Weight (g)</Table.HeaderCell>
                  <Table.HeaderCell>Outer Dimensions (mm)</Table.HeaderCell>
                  <Table.HeaderCell>Type</Table.HeaderCell>
                  <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {profiles.map((p) => (
                  <Table.Row key={p.id}>
                    <Table.Cell className="font-semibold text-ui-fg-base">
                      {p.name}
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="blue" size="small">
                        {p.packageFormatLabel || p.packageFormatIdentifier}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs">
                      {p.weightInGrams} g
                    </Table.Cell>
                    <Table.Cell className="font-mono text-xs text-ui-fg-subtle">
                      {p.dimensions.heightInMms} × {p.dimensions.widthInMms} × {p.dimensions.depthInMms} mm
                    </Table.Cell>
                    <Table.Cell>
                      {p.isSystem ? (
                        <Badge color="grey" size="small">Default Preset</Badge>
                      ) : (
                        <Badge color="green" size="small">Custom</Badge>
                      )}
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="small"
                          variant="secondary"
                          onClick={() => startEdit(p)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
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
          </div>
        </div>

        {/* Create / Edit Form */}
        <form onSubmit={handleSaveProfile} className="p-6 bg-ui-bg-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Heading level="h2" className="text-base font-semibold text-ui-fg-base">
                {editingId ? "✏️ Edit Packaging Profile" : "➕ Create Packaging Profile"}
              </Heading>
              <Text className="text-ui-fg-subtle text-xs mt-0.5">
                {editingId ? "Update existing preset values." : "Add a custom packaging specification."}
              </Text>
            </div>
            {editingId && (
              <Button size="small" variant="secondary" onClick={cancelEdit}>
                ✕ Cancel Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Profile Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 5x Vial Cold Pack Mailer"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Royal Mail Package Format</Label>
              <select
                value={packageFormat}
                onChange={(e) => setPackageFormat(e.target.value)}
                className="w-full border rounded-md p-2 text-xs bg-ui-bg-base text-ui-fg-base"
              >
                <option value="smallParcel">Small Parcel (Cold-Chain Box)</option>
                <option value="largeLetter">Large Letter (Vial Box)</option>
                <option value="mediumParcel">Medium Parcel</option>
                <option value="parcel">Parcel</option>
                <option value="largeParcel">Large Parcel</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Gross Weight (grams)</Label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value, 10) || 1))}
                placeholder="240"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-ui-fg-base mb-1 block">Outer Dimensions (H × W × D mm)</Label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-ui-fg-muted block">Height (H)</span>
                  <Input
                    type="number"
                    value={h}
                    onChange={(e) => setH(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    placeholder="80"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-ui-fg-muted block">Width (W)</span>
                  <Input
                    type="number"
                    value={w}
                    onChange={(e) => setW(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    placeholder="160"
                    required
                  />
                </div>
                <div>
                  <span className="text-[10px] text-ui-fg-muted block">Depth (D)</span>
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
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button size="small" variant="primary" type="submit" disabled={isSaving || !name.trim()}>
              {isSaving ? "Saving..." : editingId ? "Update Packaging Profile" : "Save Packaging Profile"}
            </Button>
            {editingId && (
              <Button size="small" variant="secondary" onClick={cancelEdit}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Container>
    </div>
  );
}
