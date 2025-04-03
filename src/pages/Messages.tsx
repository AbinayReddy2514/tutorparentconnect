
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Messages = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Communication</CardTitle>
          <CardDescription>
            Chat with parents and students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>This section will allow you to send and receive messages.</p>
          <p className="mt-4 text-muted-foreground">
            Check back soon for messaging functionality!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Messages;
