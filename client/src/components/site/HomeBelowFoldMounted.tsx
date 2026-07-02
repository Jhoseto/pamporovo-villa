import { PropertyDetailsSection } from "@/components/site/PropertyDetailsSection";
import { ScrollPanelExperience } from "@/components/site/ScrollPanelExperience";

/** Separate chunk — loaded after mobile critical path. */
export function HomeBelowFoldMounted() {
  return (
    <>
      <PropertyDetailsSection />
      <ScrollPanelExperience />
    </>
  );
}
