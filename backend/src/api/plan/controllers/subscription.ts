"use strict";

module.exports = {
  async getPlans(ctx) {
    const plans = await strapi.db.query("api::plan.plan").findMany({
      where: { active: true },
      populate: {
        plan_features: {
          populate: ['feature']
        }
      },
      orderBy: { price: 'asc' }
    });

    const formattedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      price_type: plan.price_type,
      features: plan.plan_features?.map(pf => ({
        name: pf.feature.name,
        description: pf.feature.description,
        value: pf.feature_value
      })) || []
    }));

    ctx.send({ plans: formattedPlans });
  },

  async subscribeToPlan(ctx) {
    const authUtils = require("../../../middlewares/auth");
    try {
      const { user } = await authUtils.extractAndVerifyToken(ctx);
      const userId = user.id;
      const { planId, billing_cycle } = ctx.request.body;

    if (!planId || !billing_cycle) {
      return ctx.badRequest("Plan ID and billing cycle are required");
    }

    // Validate billing cycle
    if (!['monthly', 'yearly', 'lifetime'].includes(billing_cycle)) {
      return ctx.badRequest("Invalid billing cycle");
    }

    // Check if plan exists
    const plan = await strapi.db.query("api::plan.plan").findOne({
      where: { id: planId, active: true }
    });

    if (!plan) {
      return ctx.notFound("Plan not found");
    }

    // Check if user already has an active subscription
    const existingSubscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      }
    });

    if (existingSubscription) {
      // Cancel existing subscription
      await strapi.db.query("api::user-subscription-plan.user-subscription-plan").update({
        where: { id: existingSubscription.id },
        data: { 
          status: 'cancelled',
          plan_end_date: new Date()
        }
      });
    }

    // Calculate end date based on billing cycle
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
        plan: planId,
        plan_start_date: new Date(),
        plan_end_date,
        billing_cycle,
        status: 'active',
        payment_status: plan.name === 'Starter' ? 'completed' : 'pending'
      }
    });

      ctx.send({
        message: "Successfully subscribed to plan",
        subscription: {
          id: newSubscription.id,
          plan: plan.name,
          billing_cycle,
          status: newSubscription.status,
          plan_start_date: newSubscription.plan_start_date,
          plan_end_date: newSubscription.plan_end_date
        }
      });
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  },

  async getUserSubscription(ctx) {
    const authUtils = require("../../../middlewares/auth");
    try {
      const { user } = await authUtils.extractAndVerifyToken(ctx);
      const userId = user.id;

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
      return ctx.send({ subscription: null });
    }

      ctx.send({
        subscription: {
          id: subscription.id,
          plan: {
            id: subscription.plan.id,
            name: subscription.plan.name,
            description: subscription.plan.description,
            price: subscription.plan.price,
            price_type: subscription.plan.price_type
          },
          billing_cycle: subscription.billing_cycle,
          status: subscription.status,
          payment_status: subscription.payment_status,
          plan_start_date: subscription.plan_start_date,
          plan_end_date: subscription.plan_end_date,
          features: subscription.plan.plan_features?.map(pf => ({
            name: pf.feature.name,
            description: pf.feature.description,
            value: pf.feature_value
          })) || []
        }
      });
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  },

  async cancelSubscription(ctx) {
    const authUtils = require("../../../middlewares/auth");
    try {
      const { user } = await authUtils.extractAndVerifyToken(ctx);
      const userId = user.id;

    const subscription = await strapi.db.query("api::user-subscription-plan.user-subscription-plan").findOne({
      where: { 
        user: userId, 
        status: 'active' 
      },
      populate: ['plan']
    });

    if (!subscription) {
      return ctx.notFound("No active subscription found");
    }

    // Don't allow cancelling starter plan
    if (subscription.plan.name === 'Starter') {
      return ctx.badRequest("Cannot cancel starter plan");
    }

    await strapi.db.query("api::user-subscription-plan.user-subscription-plan").update({
      where: { id: subscription.id },
      data: { 
        status: 'cancelled',
        plan_end_date: new Date()
      }
    });

    // Assign starter plan
    const starterPlan = await strapi.db.query("api::plan.plan").findOne({
      where: { name: 'Starter' }
    });

    if (starterPlan) {
      await strapi.db.query("api::user-subscription-plan.user-subscription-plan").create({
        data: {
          user: userId,
          plan: starterPlan.id,
          plan_start_date: new Date(),
          billing_cycle: 'monthly',
          status: 'active',
          payment_status: 'completed'
        }
      });
    }

      ctx.send({ message: "Subscription cancelled successfully" });
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  },

  async getSubscriptionHistory(ctx) {
    const authUtils = require("../../../middlewares/auth");
    try {
      const { user } = await authUtils.extractAndVerifyToken(ctx);
      const userId = user.id;

    const subscriptions = await strapi.db.query('api::user-subscription-plan.user-subscription-plan').findMany({
      where: { user: userId },
      populate: ['plan'],
      orderBy: { createdAt: 'desc' }
    });

    const history = subscriptions.map(sub => ({
      id: sub.id,
      plan: sub.plan.name,
      billing_cycle: sub.billing_cycle,
      status: sub.status,
      payment_status: sub.payment_status,
      plan_start_date: sub.plan_start_date,
      plan_end_date: sub.plan_end_date,
      created_at: sub.createdAt
    }));

      ctx.send({ history });
    } catch (error) {
      return ctx.unauthorized('Invalid token');
    }
  }
};
