import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { ShoppingBag, TriangleRightMini } from "@medusajs/icons"
import { Container, Text } from "@medusajs/ui"
import { Link } from "react-router-dom"

const PACKAGING_PROFILES_PATH = "/settings/locations/packaging-profiles"
const PACKAGING_PROFILES_DESCRIPTION =
  "Box dimensions, gross weight presets, and packaging formats for Royal Mail dispatch."

const LocationListPackagingProfiles = () => {
  return (
    <Container className="p-0 pt-2">
      <Link to={PACKAGING_PROFILES_PATH} className="group outline-none">
        <div className="flex flex-col gap-2 px-2 pb-2">
          <div className="shadow-elevation-card-rest bg-ui-bg-component transition-fg hover:bg-ui-bg-component-hover active:bg-ui-bg-component-pressed group-focus-visible:shadow-borders-interactive-with-active rounded-md px-4 py-2">
            <div className="flex items-center gap-4">
              <div className="shadow-borders-base flex size-7 items-center justify-center rounded-md [&>div]:bg-ui-bg-field [&>div]:text-ui-fg-subtle [&>div]:flex [&>div]:size-6 [&>div]:items-center [&>div]:justify-center [&>div]:rounded-[4px]">
                <div>
                  <ShoppingBag />
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <Text size="small" leading="compact" weight="plus">
                  Packaging Profiles
                </Text>
                <Text size="small" leading="compact" className="text-ui-fg-subtle">
                  {PACKAGING_PROFILES_DESCRIPTION}
                </Text>
              </div>
              <div className="flex size-7 items-center justify-center">
                <TriangleRightMini className="text-ui-fg-muted rtl:rotate-180" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </Container>
  )
}

export default LocationListPackagingProfiles

export const config = defineWidgetConfig({
  zone: "location.list.side.after",
})
