
import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
}

interface TabMenuProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
  tabClassName?: string;
}

const TabMenu: React.FC<TabMenuProps> = ({
  tabs,
  defaultTab,
  onChange,
  className,
  tabClassName,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0].id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange && onChange(tabId);
  };

  return (
    <div
      className={cn(
        "flex items-center rounded-xl p-1 bg-secondary/30 shadow-inner-dark shadow-inner-light",
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300",
            activeTab === tab.id
              ? "neu-button-active"
              : "text-muted-foreground hover:text-foreground",
            tabClassName
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabMenu;
