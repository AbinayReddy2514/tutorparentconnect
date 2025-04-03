
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Account Settings</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will allow you to update your profile and preferences.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for account settings functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
