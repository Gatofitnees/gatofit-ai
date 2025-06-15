
const Index = () => {
  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-background"
      style={{
        paddingTop: 'var(--safe-area-inset-top)',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        paddingLeft: 'var(--safe-area-inset-left)',
        paddingRight: 'var(--safe-area-inset-right)',
      }}
    >
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Welcome to Your Blank App</h1>
        <p className="text-xl text-muted-foreground">Start building your amazing project here!</p>
      </div>
    </div>
  );
};

export default Index;
