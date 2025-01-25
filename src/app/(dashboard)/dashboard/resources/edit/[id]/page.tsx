import { use } from "react";
import EditResourceForm from '@/components/ui/EditResourceForm';

export default function EditResourcePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  return (
    <div className="mx-auto">
      <EditResourceForm resourceId={id} />
    </div>
  );
}