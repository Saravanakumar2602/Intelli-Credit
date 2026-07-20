import React, { useState } from "react";
import { motion } from "framer-motion";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
  onChange?: (tabId: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  defaultTab,
  className = "",
  onChange
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    if (onChange) onChange(id);
  };

  const activeContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={`space-y-6 w-full ${className}`}>
      <div className="flex border-b border-[var(--border-light)] gap-2 overflow-x-auto select-none scrollbar-none">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeTab;
          
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none ${
                isActive 
                  ? "text-[#002B49] dark:text-slate-100 font-bold" 
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {Icon && <Icon className="w-4 h-4" />}
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="w-full"
      >
        {activeContent}
      </motion.div>
    </div>
  );
};
