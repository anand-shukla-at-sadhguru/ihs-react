import * as React from "react"
import {
  // ChevronRight 
} from "lucide-react"

// import { SearchForm } from "@/components/search-form"
// import { VersionSwitcher } from "@/components/version-switcher"
import {
  // Collapsible,
  // CollapsibleContent,
  // CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  // SidebarGroup,
  // SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom";
import { NavItem } from "@/App";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationItems: NavItem[];
  admissionsAgreed: boolean;
}
// This is sample data.
// const data = {
//   versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
//   navMain: [
//     {
//       title: "Getting Started",
//       url: "#",
//       items: [
//         {
//           title: "Installation",
//           url: "#",
//         },
//         {
//           title: "Project Structure",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Building Your Application",
//       url: "#",
//       items: [
//         {
//           title: "Routing",
//           url: "#",
//         },
//         {
//           title: "Data Fetching",
//           url: "#",
//           isActive: true,
//         },
//         {
//           title: "Rendering",
//           url: "#",
//         },
//         {
//           title: "Caching",
//           url: "#",
//         },
//         {
//           title: "Styling",
//           url: "#",
//         },
//         {
//           title: "Optimizing",
//           url: "#",
//         },
//         {
//           title: "Configuring",
//           url: "#",
//         },
//         {
//           title: "Testing",
//           url: "#",
//         },
//         {
//           title: "Authentication",
//           url: "#",
//         },
//         {
//           title: "Deploying",
//           url: "#",
//         },
//         {
//           title: "Upgrading",
//           url: "#",
//         },
//         {
//           title: "Examples",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "API Reference",
//       url: "#",
//       items: [
//         {
//           title: "Components",
//           url: "#",
//         },
//         {
//           title: "File Conventions",
//           url: "#",
//         },
//         {
//           title: "Functions",
//           url: "#",
//         },
//         {
//           title: "next.config.js Options",
//           url: "#",
//         },
//         {
//           title: "CLI",
//           url: "#",
//         },
//         {
//           title: "Edge Runtime",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Architecture",
//       url: "#",
//       items: [
//         {
//           title: "Accessibility",
//           url: "#",
//         },
//         {
//           title: "Fast Refresh",
//           url: "#",
//         },
//         {
//           title: "Next.js Compiler",
//           url: "#",
//         },
//         {
//           title: "Supported Browsers",
//           url: "#",
//         },
//         {
//           title: "Turbopack",
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: "Community",
//       url: "#",
//       items: [
//         {
//           title: "Contribution Guide",
//           url: "#",
//         },
//       ],
//     },
//   ],
// }

export function AppSidebar({ navigationItems, admissionsAgreed, ...props }: AppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        />
        <SearchForm /> */}
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {/* {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            title={item.title}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel
                asChild
                className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {item.title}{" "}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {item.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={item.isActive}>
                          <a href={item.url}>{item.title}</a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))} */}
        <SidebarMenu>
          {navigationItems.map((item) => {
            if (item.requiresAdmissionsAgreed && !admissionsAgreed) {
              return null;
            }
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    key={item.title}
                    to={item.to}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
                    target={item.isExternal ? "_blank" : undefined}
                    rel={item.isExternal ? "noopener noreferrer" : undefined}
                  >
                    {item.title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
