import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export const ComparisonRow = ({ feature, byteInit, generic, social }: { 
  feature: string;
  byteInit: string;
  generic: string;
  social: string;
}) => {
  const renderCell = (text: string) => {
    const isPositive = text.startsWith("✓");
    const isNeutral = text.startsWith("~");
    const isNegative = text.startsWith("✕");
    
    let icon = null;
    if (isPositive) {
      icon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    } else if (isNeutral) {
      icon = <AlertCircle className="h-5 w-5 text-amber-500" />;
    } else if (isNegative) {
      icon = <XCircle className="h-5 w-5 text-muted-foreground" />;
    }
    
    const content = text.substring(2).trim();
    
    return (
      <div className="flex flex-col items-center justify-center text-center gap-2">
        {icon}
        <span className="text-sm">{content}</span>
      </div>
    );
  };
  
  return (
    <tr className="border-b border-border/30 transition-colors hover:bg-muted/5">
      <td className="py-4 px-4">
        <div className="font-medium">{feature}</div>
      </td>
      <td className="py-4 px-4">
        {renderCell(byteInit)}
      </td>
      <td className="py-4 px-4">
        {renderCell(generic)}
      </td>
      <td className="py-4 px-4">
        {renderCell(social)}
      </td>
    </tr>
  );
};

export const PartnerCard = ({ name, description, icon, type }: {
  name: string;
  description: string;
  icon: React.ReactNode;
  type: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="card-with-border-effect bg-card rounded-xl p-5 border border-border/30 transition-all duration-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-2.5 rounded-xl bg-primary/5 text-primary">
          {icon}
        </div>
        <Badge variant="outline" className="text-[10px] rounded-full px-2">
          {type}
        </Badge>
      </div>
      <h3 className="font-semibold mb-2">{name}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export const IntegrationCategory = ({ title, description, icon }: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl bg-gradient-to-b from-primary/5 to-primary/10 border border-primary/20 p-6"
    >
      <div className="p-3 rounded-xl bg-background/80 text-primary w-fit mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}; 