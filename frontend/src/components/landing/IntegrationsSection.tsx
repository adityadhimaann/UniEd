import { motion } from "framer-motion";

const integrations = [
  { name: "Google Classroom", logo: "https://www.gstatic.com/classroom/logo_square_rounded.svg" },
  { name: "Microsoft Teams", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Microsoft_Office_Teams_%282025%E2%80%93present%29.svg/1942px-Microsoft_Office_Teams_%282025%E2%80%93present%29.svg.png" },
  { name: "Canvas", logo: "https://www.computerhope.com/jargon/c/canvas.png" },
  { name: "Zoom", logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Zoom_Communications_Logo.svg" },
  { name: "Slack", logo: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" },
  { name: "Notion", logo: "https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" },
];

export function IntegrationsSection() {
  return (
    <section className="py-16 relative overflow-hidden border-y border-border/50">
      <div className="container relative z-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="font-display text-xl md:text-2xl font-semibold text-muted-foreground">
            Integrates with your favorite tools
          </h3>
        </motion.div>

        {/* Infinite scroll logos */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
          
          <motion.div 
            className="flex gap-12 items-center"
            animate={{ x: [0, -1200] }}
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear",
            }}
          >
            {[...integrations, ...integrations, ...integrations, ...integrations].map((integration, index) => (
              <div
                key={`${integration.name}-${index}`}
                className="flex items-center gap-3 shrink-0 glass rounded-xl px-6 py-4 hover:bg-card/80 transition-colors"
              >
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-sm font-medium whitespace-nowrap">{integration.name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
