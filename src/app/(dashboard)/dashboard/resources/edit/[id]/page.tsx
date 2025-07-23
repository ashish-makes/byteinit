import { use } from "react";
import EditResourceForm from '@/components/ui/EditResourceForm';

export default function EditResourcePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 w-full">
      <EditResourceForm resourceId={id} />
    </div>
  );
}