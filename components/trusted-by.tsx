export default function TrustedBy() {
  const organizations = [
    { name: 'Organization 1', logo: '01' },
    { name: 'Organization 2', logo: '02' },
    { name: 'Organization 3', logo: '03' },
    { name: 'Organization 4', logo: '04' },
    { name: 'Organization 5', logo: '05' },
  ];

  return (
    <section className="py-16 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Trusted by 500+ Organizations</h2>
          <p className="text-muted-foreground">Leading companies rely on our expertise</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
          {organizations.map((org, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center h-20 bg-secondary rounded-lg text-primary font-bold text-2xl"
            >
              {org.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
