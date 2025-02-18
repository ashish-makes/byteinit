import ResourceListing from '@/components/ui/ResourcesListing';

export default function ResourcesPage() {
  return (
    <div className="pt-20">
      <ResourceListing 
        hideFilters={true}  // Hide all filter dropdowns
      />
    </div>
  );
}