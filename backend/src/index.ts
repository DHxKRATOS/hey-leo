// import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    try {
      // Seed plans and features if they don't exist
      const existingPlans = await strapi.db.query("api::plan.plan").findMany();

      if (existingPlans.length === 0) {
        // Create features first
        const features = [
          {
            name: "Storage",
            description: "Cloud storage space for your files",
          },
          { name: "API Calls", description: "Number of API calls per month" },
          { name: "Support", description: "Customer support level" },
          {
            name: "Business Cards",
            description: "Number of business cards you can create",
          },
          { name: "Contacts", description: "Number of contacts you can store" },
          {
            name: "Custom Branding",
            description: "Add your own branding to cards",
          },
          { name: "Analytics", description: "Advanced analytics and insights" },
          {
            name: "Team Members",
            description: "Number of team members allowed",
          },
        ];

        const createdFeatures = [];
        for (const feature of features) {
          try {
            const existing = await strapi.db
              .query("api::feature.feature")
              .findOne({
                where: { name: feature.name },
              });

            if (!existing) {
              const created = await strapi.db
                .query("api::feature.feature")
                .create({
                  data: feature,
                });
              createdFeatures.push(created);
            } else {
              createdFeatures.push(existing);
            }
          } catch (error) {
            console.error(`Error creating feature ${feature.name}:`, error);
          }
        }

        // Create plans
        const plans = [
          {
            name: "Starter",
            description: "Try before you buy",
            price: 0.0,
            price_type: "monthly",
            active: true,
          },
          {
            name: "Professional",
            description: "Everything you need to succeed",
            price: 9.0,
            price_type: "monthly",
            active: true,
          },
          {
            name: "Executive",
            description: "Scale without limits",
            price: 0.0,
            price_type: "contact",
            active: true,
          },
        ];

        const createdPlans = [];
        for (const plan of plans) {
          try {
            const existing = await strapi.db.query("api::plan.plan").findOne({
              where: { name: plan.name },
            });

            if (!existing) {
              const created = await strapi.db.query("api::plan.plan").create({
                data: plan,
              });
              createdPlans.push(created);
            } else {
              createdPlans.push(existing);
            }
          } catch (error) {
            console.error(`Error creating plan ${plan.name}:`, error);
          }
        }

        // Create feature map
        const featureMap = {};
        createdFeatures.forEach((f) => (featureMap[f.name] = f.id));

        // Create plan-feature relationships
        const planFeatureData = {
          Starter: [
            { feature: "Storage", value: "50MB" },
            { feature: "API Calls", value: "100" },
            { feature: "Support", value: "Basic QR code" },
            { feature: "Business Cards", value: "1" },
            { feature: "Contacts", value: "50" },
            { feature: "Custom Branding", value: "false" },
            { feature: "Analytics", value: "Basic QR code" },
            { feature: "Team Members", value: "1" },
          ],
          Professional: [
            { feature: "Storage", value: "1000 credits" },
            { feature: "API Calls", value: "1000" },
            { feature: "Support", value: "Email support" },
            { feature: "Business Cards", value: "5" },
            { feature: "Contacts", value: "100 monthly card views" },
            { feature: "Custom Branding", value: "true" },
            { feature: "Analytics", value: "5 website trainings" },
            {
              feature: "Team Members",
              value: "3 documents take (up to 10,000)",
            },
          ],
          Executive: [
            { feature: "Storage", value: "Unlimited active cards" },
            { feature: "API Calls", value: "Unlimited monthly card views" },
            { feature: "Support", value: "Priority Support" },
            { feature: "Business Cards", value: "Unlimited contacts storage" },
            {
              feature: "Contacts",
              value: "5,000 documents/month (up to 10,000)",
            },
            { feature: "Custom Branding", value: "true" },
            { feature: "Analytics", value: "Unlimited website trainings" },
            {
              feature: "Team Members",
              value: "50 documents/month for AI training",
            },
          ],
        };

        for (const plan of createdPlans) {
          const features = planFeatureData[plan.name];
          if (features) {
            for (const featureData of features) {
              try {
                const featureId = featureMap[featureData.feature];
                if (featureId) {
                  // Check if plan-feature relationship already exists
                  const existing = await strapi.db
                    .query("api::plan-feature.plan-feature")
                    .findOne({
                      where: {
                        plan: plan.id,
                        feature: featureId,
                      },
                    });

                  if (!existing) {
                    await strapi.db
                      .query("api::plan-feature.plan-feature")
                      .create({
                        data: {
                          plan: plan.id,
                          feature: featureId,
                          feature_value: featureData.value,
                        },
                      });
                  }
                }
              } catch (error) {
                console.error(
                  `Error creating plan-feature for ${plan.name} - ${featureData.feature}:`,
                  error
                );
              }
            }
          }
        }
      } else {
      }
    } catch (error) {
      console.error("Error during bootstrap seeding:", error);
    }
  },
};
