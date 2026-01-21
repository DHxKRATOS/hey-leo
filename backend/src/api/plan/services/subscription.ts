"use strict";

module.exports = {
  async checkFeatureAccess(userId, featureName) {
    const subscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      },
      populate: {
        plan: {
          populate: {
            plan_features: {
              populate: ['feature']
            }
          }
        }
      }
    });

    if (!subscription) {
      return { hasAccess: false, limit: 0 };
    }

    const feature = subscription.plan.plan_features?.find(
      pf => pf.feature.name === featureName
    );

    if (!feature) {
      return { hasAccess: false, limit: 0 };
    }

    return {
      hasAccess: true,
      limit: feature.feature_value === 'unlimited' ? -1 : parseInt(feature.feature_value) || 0,
      value: feature.feature_value
    };
  },

  async getUserPlanFeatures(userId) {
    const subscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      },
      populate: {
        plan: {
          populate: {
            plan_features: {
              populate: ['feature']
            }
          }
        }
      }
    });

    if (!subscription) {
      return [];
    }

    return subscription.plan.plan_features?.map(pf => ({
      name: pf.feature.name,
      description: pf.feature.description,
      value: pf.feature_value,
      limit: pf.feature_value === 'unlimited' ? -1 : parseInt(pf.feature_value) || 0
    })) || [];
  },

  async isSubscriptionActive(userId) {
    const subscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      }
    });

    if (!subscription) {
      return false;
    }

    // Check if subscription has expired
    if (subscription.plan_end_date && new Date() > new Date(subscription.plan_end_date)) {
      // Mark as expired
      await strapi.db.query("api::user-subscription-plan.user-subscription-plan").update({
        where: { id: subscription.id },
        data: { status: 'expired' }
      });
      return false;
    }

    return true;
  },

  async upgradeSubscription(userId, newPlanId, billing_cycle) {
    const currentSubscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      },
      populate: ['plan']
    });

    const newPlan = await strapi.db.query("api::plan.plan").findOne({
      where: { id: newPlanId, active: true }
    });

    if (!newPlan) {
      throw new Error('Plan not found');
    }

    // Check if it's actually an upgrade
    if (currentSubscription && currentSubscription.plan.price >= newPlan.price) {
      throw new Error('This is not an upgrade');
    }

    // Cancel current subscription
    if (currentSubscription) {
      await strapi.db.query("api::user-subscription-plan.user-subscription-plan").update({
        where: { id: currentSubscription.id },
        data: { 
          status: 'cancelled',
          plan_end_date: new Date()
        }
      });
    }

    // Calculate end date
    let plan_end_date = null;
    if (billing_cycle !== 'lifetime') {
      const startDate = new Date();
      plan_end_date = new Date(startDate);
      if (billing_cycle === 'monthly') {
        plan_end_date.setMonth(plan_end_date.getMonth() + 1);
      } else if (billing_cycle === 'yearly') {
        plan_end_date.setFullYear(plan_end_date.getFullYear() + 1);
      }
    }

    // Create new subscription
    const newSubscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").create({
      data: {
        user: userId,
        plan: newPlanId,
        plan_start_date: new Date(),
        plan_end_date,
        billing_cycle,
        status: 'active',
        payment_status: 'pending'
      }
    });

    return newSubscription;
  }
};
