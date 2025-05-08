import { Button } from "@/components/ui/button"; // Use alias
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"; // Use alias
import { Input } from "@/components/ui/input"; // Use alias
import { useState } from "react";

export default function HomePage() {
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to the Starter!</CardTitle>
          <CardDescription>This is a demo page using Tailwind and Shadcn/ui components.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Vite + React + TypeScript + Tailwind CSS + Shadcn/ui + PWA
          </p>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setCount((c) => c + 1)}>
              Count is: {count}
            </Button>
            <Input placeholder="Example Input" className="max-w-xs" />
          </div>
          <p className="text-sm text-muted-foreground">
            Try toggling dark mode using the button in the header. Check the browser console for PWA service worker messages.
          </p>
        </CardContent>
      </Card>

      <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">PWA Information</h2>
          <p>This application is configured as a Progressive Web App (PWA).</p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
          <li>Check your browser's developer tools (Application tab {'>'} Manifest & Service Workers) to inspect the PWA configuration.</li> 
              <li>On supported browsers/platforms (like Chrome on Desktop/Android, Safari on iOS), you should see an install prompt (often in the address bar).</li>
              <li>Once installed, the app can work offline thanks to the service worker caching assets.</li>
          </ul>
      </div>
    </div>
  );
}