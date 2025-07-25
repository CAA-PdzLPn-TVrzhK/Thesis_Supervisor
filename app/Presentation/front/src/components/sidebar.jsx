"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./ui/sidebar.tsx";
import {
  IconSettings,
  IconUserPlus,
  IconEyeglass,
  IconHome,
  IconMenu,
  IconNotebook,
  IconFlag,
  IconUsers,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

export function SidebarMenu({ children }) {
  const location = useLocation();
  const links = [
    {
      label: "Main Page",
      icon: (
        <IconHome className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/"
    },
    {
      label: "Students",
      icon: (
        <IconNotebook className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/students"
    },
    {
      label: "Supervisors",
      icon: (
        <IconEyeglass className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/supervisors"
    },
    {
      label: "New Students",
      icon: (
        <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/new-students"
    },
    {
      label: "New Supervisors",
      icon: (
        <IconUserPlus className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/new-supervisors"
    },
    {
      label: "Groups",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/groups"
    },
    {
      label: "Milestones",
      icon: (
        <IconFlag className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/milestones"
    },
    {
      label: "Settings",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
      ),
      to: "/settings"
    },
  ];
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-md border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
        "min-h-screen",
          "min-w-screen"
      )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div className="mt-8 flex flex-col gap-2">
              {links.map((l, idx) => (
                <Link key={idx} to={l.to} style={{ textDecoration: 'none' }}>
                  <SidebarLink
                    link={{
                      label: l.label,
                      icon: l.icon,
                      href: l.to,
                    }}
                    className={location.pathname === l.to ? 'bg-neutral-200 dark:bg-neutral-700' : ''}
                  />
                </Link>
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "Back-office Menu",
                href: "#",
                icon: (
                  <img
                      src={"data:image/jpeg;base64,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"}
                    className="h-7 w-7 shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar" />
                ),
              }} />
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
      <a
          href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white">
        Acet Labs
      </motion.span>
    </a>
  );
};
export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
      <div
        className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
    </a>
  );
};