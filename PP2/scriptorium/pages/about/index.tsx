// pages/about/index.tsx

export default function About() {
  const teamMembers = [
    {
      name: "Utku Egemen Umut",
      role: "Software Developer",
      description: "3rd year CS student at the University of Toronto"
    },
    {
      name: "Bora Bayazit",
      role: "Software Developer",
      description: "4th year ECE student at the University of Toronto"
    },
    {
      name: "Jihyuk",
      role: "Software Developer",
      description: "3rd year CS student at the University of Toronto"
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <header className="relative flex flex-col items-center justify-center text-center bg-gradient-to-r from-primary to-primary/70 text-primary-foreground py-24 px-6">
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Our Mission</h1>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto">
            Empowering developers to write, test, and share code effortlessly.
            We're building the future of collaborative coding environments.
          </p>
        </div>
      </header>

      {/* Story Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Story</h2>
          <div className="bg-card rounded-xl shadow-md p-8 space-y-6 text-card-foreground">
            <p className="text-muted-foreground leading-relaxed">
              Scriptorium was born from a simple observation: developers spend too much time
              setting up environments and not enough time actually coding. We set out to
              change that in 2023.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our platform combines the power of cloud computing with an intuitive interface,
              making it possible to write and execute code in any language without the hassle
              of local setup.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Today, we're proud to support a growing community of developers, students, and
              educators who use Scriptorium to learn, teach, and build amazing things.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-secondary">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center text-secondary-foreground">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card rounded-lg p-8 shadow-md text-card-foreground">
              <h3 className="text-xl font-bold mb-4">Innovation</h3>
              <p className="text-muted-foreground">
                We constantly push the boundaries of what's possible in browser-based
                development environments.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 shadow-md text-card-foreground">
              <h3 className="text-xl font-bold mb-4">Community</h3>
              <p className="text-muted-foreground">
                We believe in the power of community and open collaboration to drive
                innovation forward.
              </p>
            </div>
            <div className="bg-card rounded-lg p-8 shadow-md text-card-foreground">
              <h3 className="text-xl font-bold mb-4">Security</h3>
              <p className="text-muted-foreground">
                We prioritize the security and privacy of our users' code and data
                above everything else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div 
                key={index}
                className="bg-card rounded-lg p-6 shadow-md text-card-foreground"
              >
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary mb-2">{member.role}</p>
                <p className="text-muted-foreground">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6 bg-secondary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8 text-secondary-foreground">Get in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions about Scriptorium? We'd love to hear from you and help!
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="mailto:support@scriptorium.dev"
              className="bg-card text-card-foreground px-8 py-3 rounded-lg hover:bg-muted transition-colors duration-200"
            >
              Email Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}