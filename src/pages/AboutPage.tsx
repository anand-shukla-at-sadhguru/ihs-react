// src/pages/AboutPage.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>About This Starter</CardTitle>
      </CardHeader>
      <CardContent>
        <p>
          This starter template provides a foundation for building modern React applications with:
        </p>
        <ul className="list-disc list-inside mt-4 space-y-1">
          <li>Vite for fast development and builds</li>
          <li>TypeScript for type safety</li>
          <li>Tailwind CSS for utility-first styling</li>
          <li>Shadcn/ui for accessible and composable UI components</li>
          <li>React Router for client-side routing</li>
          <li>Progressive Web App (PWA) features for offline support and installability</li>
          <li>ESLint and Prettier for code quality</li>
        </ul>
         <p className="mt-4 text-muted-foreground text-sm">
            Refer to the README for more details on setup and usage.
         </p>
      </CardContent>
    </Card>
  );
}