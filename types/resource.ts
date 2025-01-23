export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    type: string;
    category: string;
    tags?: string[];
  }
  
  export interface SavedResource {
    id: string;
    resourceId: string;
  }
  