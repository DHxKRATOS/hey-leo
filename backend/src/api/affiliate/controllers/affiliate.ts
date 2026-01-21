"use strict";

const cryptoLib = require("crypto");

module.exports = {
  async getStats(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;

      // Get or create user's referral code
      let user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
      });

      if (!user.referral_code) {
        // Generate referral code if it doesn't exist
        const referralCode = `${user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 3) || 'USR'}${userId.toString().slice(-3)}${cryptoLib.randomBytes(2).toString('hex').toUpperCase()}`;
        
        await strapi.db.query("api::user.user").update({
          where: { id: userId },
          data: { referral_code: referralCode },
        });
        
        user.referral_code = referralCode;
      }

      // Get referral statistics
      const referrals = await strapi.db.query("api::user.user").findMany({
        where: { referred_by: userId },
        populate: {
          user_subscription_plans: {
            populate: ['plan']
          }
        }
      });

      const totalReferrals = referrals.length;
      const activeReferrals = referrals.filter(ref => 
        ref.user_subscription_plans?.some(sub => sub.status === 'active' && sub.plan.name !== 'Starter')
      ).length;

      // Calculate earnings (20% commission on paid plans)
      const commissionRate = 0.20;
      let totalEarnings = 0;
      let monthlyEarnings = 0;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      referrals.forEach(referral => {
        const activePaidSub = referral.user_subscription_plans?.find(sub => 
          sub.status === 'active' && sub.plan.name !== 'Starter'
        );
        
        if (activePaidSub) {
          const planEarning = activePaidSub.plan.price * commissionRate;
          totalEarnings += planEarning;
          
          const subDate = new Date(activePaidSub.plan_start_date);
          if (subDate.getMonth() === currentMonth && subDate.getFullYear() === currentYear) {
            monthlyEarnings += planEarning;
          }
        }
      });

      const conversionRate = totalReferrals > 0 ? (activeReferrals / totalReferrals) * 100 : 0;
      
      // Calculate next payout date (1st of next month)
      const nextPayout = new Date();
      nextPayout.setMonth(nextPayout.getMonth() + 1);
      nextPayout.setDate(1);

      // Get recent referrals with details
      const recentReferrals = referrals.slice(-5).map(ref => {
        const activeSub = ref.user_subscription_plans?.find(sub => sub.status === 'active');
        return {
          id: ref.id,
          email: ref.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email for privacy
          date: ref.createdAt,
          commission: activeSub && activeSub.plan.name !== 'Starter' ? 
            activeSub.plan.price * commissionRate : 0,
          status: activeSub?.status || 'inactive'
        };
      });

      ctx.send({
        referralCode: user.referral_code,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
        pendingPayouts: Math.round(totalEarnings * 100) / 100, // Assuming all earnings are pending
        activeReferrals,
        totalReferrals,
        conversionRate: Math.round(conversionRate * 100) / 100,
        commissionRate: commissionRate * 100,
        nextPayoutDate: nextPayout.toISOString().split('T')[0],
        recentReferrals
      });
    } catch (error) {
      console.error("Affiliate stats error:", error);
      return ctx.internalServerError("Failed to fetch affiliate statistics");
    }
  },

  async generateCode(ctx) {
    try {
      const authenticatedUser = ctx.state.user;
      if (!authenticatedUser) {
        return ctx.unauthorized("User not authenticated");
      }
      const userId = authenticatedUser.id;

      const user = await strapi.db.query("api::user.user").findOne({
        where: { id: userId },
      });

      // Generate new referral code
      const referralCode = `${user.name?.replace(/\s+/g, '').toUpperCase().slice(0, 3) || 'USR'}${userId.toString().slice(-3)}${cryptoLib.randomBytes(2).toString('hex').toUpperCase()}`;
      
      await strapi.db.query("api::user.user").update({
        where: { id: userId },
        data: { referral_code: referralCode },
      });

      ctx.send({
        referralCode,
        message: "New referral code generated successfully"
      });
    } catch (error) {
      console.error("Generate referral code error:", error);
      return ctx.internalServerError("Failed to generate referral code");
    }
  },
};
