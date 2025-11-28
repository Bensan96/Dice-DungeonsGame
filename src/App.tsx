import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Sword, Shield, Crown, Shirt, Footprints, Gem, 
  Skull, RefreshCw, Lock, Zap, Target, 
  Trophy, ChevronRight, Backpack, Flame, AlertOctagon,
  Star, ChevronUp, BookOpen, ArrowLeft, Coins, ShoppingBag, Hand,
  Ghost, Anvil, Hammer, Sparkles, Skull as DeathIcon, BarChart2, X, 
  ChevronDown, ZapOff, Infinity, Layers, Unlock, Lock as LockIcon, LogOut, 
  Scroll, Hexagon, Gift, PackageOpen, Dices, Heart, Repeat, Check, ArrowDown,
  Plus, Minus, Map as MapIcon, Flag, FlaskConical, Beaker
} from 'lucide-react';

// --- CONSTANTS & CONFIG ---

const COMBO_TYPES = {
  PAIR: { id: 'pair', name: 'Pair', baseDmg: 15 },
  TWO_PAIR: { id: 'two_pair', name: 'Two Pair', baseDmg: 40 },
  TRIPLE: { id: 'triple', name: 'Three of a Kind', baseDmg: 50 },
  STRAIGHT_SM: { id: 'straight_sm', name: 'Small Straight', baseDmg: 80 },
  STRAIGHT_LG: { id: 'straight_lg', name: 'Large Straight', baseDmg: 100 },
  QUAD: { id: 'quad', name: 'Four of a Kind', baseDmg: 120 },
  FULL_HOUSE: { id: 'full_house', name: 'Full House', baseDmg: 200 },
  YAHTZEE: { id: 'yahtzee', name: 'PENTASTRIKE', baseDmg: 300 },
  CHANCE: { id: 'chance', name: 'Chance', baseDmg: 10 }
};

const POTIONS = {
    XP: { id: 'pot_xp', name: 'Elixir of Insight', desc: 'Double XP for the next run.', rarity: 'rare', type: 'buff_xp', val: 2.0, color: 'text-blue-400', iconColor: 'text-blue-500' },
    GOLD: { id: 'pot_gold', name: 'Draught of Midas', desc: '+50% Gold found next run.', rarity: 'rare', type: 'buff_gold', val: 1.5, color: 'text-yellow-400', iconColor: 'text-yellow-500' },
    SCRAP: { id: 'pot_scrap', name: 'Smith\'s Brew', desc: '+50% Scraps found next run.', rarity: 'rare', type: 'buff_scrap', val: 1.5, color: 'text-stone-400', iconColor: 'text-stone-500' },
    LUCK: { id: 'pot_luck', name: 'Fortune\'s Favor', desc: 'Increases legendary drop rates drastically next run.', rarity: 'legendary', type: 'buff_luck', val: 0.3, color: 'text-amber-500', iconColor: 'text-amber-600' }
};

const LEGENDARY_EFFECTS = [
    { id: 'trickster', name: 'Trickster', desc: '15% Chance to save Reroll', type: 'utility', val: 0.15 },
    { id: 'greed', name: 'Greed', desc: '+25% Gold found', type: 'resource', val: 0.25 },
    { id: 'scholar', name: 'Scholar', desc: '+10% XP gained', type: 'resource', val: 0.10 },
    { id: 'vampire', name: 'Vampire', desc: 'Recover 1 Heart on Chance', type: 'sustain', val: 1 },
    { id: 'hydra', name: 'Hydra Heart', desc: '+2 Max Hearts (Scales Blood Rage)', type: 'tank', val: 2 },
    { id: 'hourglass', name: 'Aeon Glass', desc: '+1 Max Reroll (Scales Focus)', type: 'tactical', val: 1 },
    { id: 'midas', name: 'Golden Crown', desc: '+1% Dmg per 50 Gold owned', type: 'scaling', val: 50 }
];

const SETS = {
  warrior_60: { id: 'warrior_60', name: "Grand Marshal's Gear", bonuses: [{ pieces: 2, type: 'flat_global', val: 100 }, { pieces: 4, type: 'mult_global', val: 50 }] },
  mage_60: { id: 'mage_60', name: "High Wizard's Gear", bonuses: [{ pieces: 2, type: 'flat_global', val: 100 }, { pieces: 4, type: 'mult_global', val: 50 }] },
  rogue_60: { id: 'rogue_60', name: "Stalker's Guise", bonuses: [{ pieces: 2, type: 'flat_global', val: 100 }, { pieces: 4, type: 'mult_global', val: 50 }] }
};

// --- TALENT TREES EXPANDED ---
const TALENT_TREES = {
  warrior: {
    vanguard: { 
      name: "Vanguard", 
      icon: <Shield/>, 
      talents: [
        { id: 'w_van_1', row: 1, col: 2, name: 'Iron Skin', max: 5, desc: '+5% Scraps found', type: 'meta_scraps', val: 0.05, req: 0 },
        { id: 'w_van_2', row: 2, col: 1, name: 'Buckler', max: 5, desc: '+15 Flat Pair Dmg', type: 'flat_pair', val: 15, req: 5, prereq: 'w_van_1' },
        { id: 'w_van_3', row: 2, col: 3, name: 'Reinforce', max: 5, desc: '+20 Flat Two Pair', type: 'flat_twopair', val: 20, req: 5, prereq: 'w_van_1' },
        { id: 'w_van_4', row: 3, col: 2, name: 'Vigilance', max: 3, desc: '+1 Max Reroll', type: 'meta_max_rolls', val: 1, req: 10 },
        { id: 'w_van_5', row: 4, col: 2, name: 'Fortress', max: 5, desc: '+40 Flat Full House', type: 'flat_fullhouse', val: 40, req: 15, prereq: 'w_van_4' },
        { id: 'w_van_6', row: 5, col: 1, name: 'Blacksmith\'s Art', max: 5, desc: 'Gear Upgrades give +4% more stats per level', type: 'synergy_upgrade', val: 0.04, req: 20 },
        { id: 'w_van_7', row: 5, col: 3, name: 'Juggernaut', max: 1, desc: '+25% Global Mult', type: 'mult_global', val: 25, req: 20 },
        { id: 'w_van_8', row: 6, col: 2, name: 'Unstoppable', max: 5, desc: '+120 Flat 4-Kind', type: 'flat_quad', val: 120, req: 25, prereq: 'w_van_5' },
        { id: 'w_van_9', row: 7, col: 2, name: 'Mountain', max: 5, desc: '+50 Base Health (HP)', type: 'meta_max_hearts_flat', val: 50, req: 30, prereq: 'w_van_8' },
        { id: 'w_van_10', row: 8, col: 2, name: 'Titan', max: 1, desc: '+3 Max Hearts', type: 'meta_max_hearts', val: 3, req: 40, prereq: 'w_van_9' }
      ] 
    },
    reaver: { 
      name: "Reaver", 
      icon: <Sword/>, 
      talents: [
        { id: 'w_rea_1', row: 1, col: 2, name: 'Heavy Handed', max: 5, desc: '+5 Base Dmg', type: 'flat_global', val: 5, req: 0 },
        { id: 'w_rea_2', row: 2, col: 2, name: 'Cleave', max: 5, desc: '+25 Flat Two Pair', type: 'flat_twopair', val: 25, req: 5, prereq: 'w_rea_1' },
        { id: 'w_rea_3', row: 3, col: 1, name: 'Deep Wounds', max: 3, desc: '+15% Pair Dmg', type: 'mult_pair', val: 15, req: 10 },
        { id: 'w_rea_4', row: 3, col: 3, name: 'Sunder', max: 3, desc: '+15% 3-Kind Dmg', type: 'mult_triple', val: 15, req: 10 },
        { id: 'w_rea_5', row: 4, col: 2, name: 'Mortal Strike', max: 1, desc: '+50% Crit Dmg (Global)', type: 'mult_global', val: 50, req: 15, prereq: 'w_rea_2' },
        { id: 'w_rea_6', row: 5, col: 2, name: 'Executioner', max: 5, desc: '+30% 4-Kind', type: 'mult_quad', val: 30, req: 20, prereq: 'w_rea_5' },
        { id: 'w_rea_7', row: 5, col: 4, name: 'Blood Rage', max: 5, desc: '+5% Dmg per MISSING Heart', type: 'dynamic_missing_hearts', val: 5, req: 20 },
        { id: 'w_rea_8', row: 6, col: 2, name: 'Decapitate', max: 5, desc: '+80 Flat 4-Kind', type: 'flat_quad', val: 80, req: 25, prereq: 'w_rea_6' },
        { id: 'w_rea_9', row: 7, col: 2, name: 'First Blood', max: 3, desc: '+50% Dmg on First Roll of Combat', type: 'dynamic_first_blood', val: 50, req: 30 },
        { id: 'w_rea_10', row: 8, col: 2, name: 'Warlord', max: 1, desc: '+100% Pentastrike', type: 'mult_yahtzee', val: 100, req: 40, prereq: 'w_rea_8' }
      ] 
    },
    slayer: { 
      name: "Slayer", 
      icon: <Skull/>, 
      talents: [
        { id: 'w_sla_1', row: 1, col: 2, name: 'Bloodthirst', max: 5, desc: '+2 Gold/Kill', type: 'meta_gold_flat', val: 2, req: 0 },
        { id: 'w_sla_2', row: 2, col: 2, name: 'Opportunity', max: 5, desc: '+20 Flat Straights', type: 'flat_straight', val: 20, req: 5, prereq: 'w_sla_1' },
        { id: 'w_sla_3', row: 3, col: 1, name: 'Impale', max: 5, desc: '+25% Small Straight', type: 'mult_straight_sm', val: 25, req: 10 },
        { id: 'w_sla_4', row: 3, col: 3, name: 'Rage', max: 5, desc: '+10% Global Dmg', type: 'mult_global', val: 10, req: 10 },
        { id: 'w_sla_5', row: 4, col: 2, name: 'Execute', max: 1, desc: '+100 Flat Low Straight', type: 'flat_straight_sm', val: 100, req: 15, prereq: 'w_sla_2' },
        { id: 'w_sla_6', row: 5, col: 2, name: 'Massacre', max: 5, desc: '+30% Large Straight', type: 'mult_straight_lg', val: 30, req: 20, prereq: 'w_sla_5' },
        { id: 'w_sla_7', row: 6, col: 2, name: 'Sudden Death', max: 5, desc: '+20% Chance Dmg', type: 'mult_chance', val: 20, req: 25 },
        { id: 'w_sla_8', row: 7, col: 2, name: 'Coup de Grace', max: 3, desc: '+50% Dmg vs Enemies <30% HP', type: 'dynamic_execute', val: 50, req: 30, prereq: 'w_sla_7' },
        { id: 'w_sla_9', row: 8, col: 2, name: 'Godslayer', max: 1, desc: '+300 Flat Chance', type: 'flat_chance', val: 300, req: 40, prereq: 'w_sla_8' }
      ] 
    }
  },
  mage: {
    scholar: { 
        name: "Scholar", 
        icon: <BookOpen/>, 
        talents: [
            { id: 'm_sch_1', row: 1, col: 2, name: 'Learning', max: 5, desc: '+5% XP Gain', type: 'meta_xp', val: 0.05, req: 0 },
            { id: 'm_sch_2', row: 2, col: 1, name: 'Patience', max: 3, desc: '+1 Max Reroll', type: 'meta_max_rolls', val: 1, req: 5 }, 
            { id: 'm_sch_3', row: 2, col: 3, name: 'Calculated', max: 5, desc: '+25 Flat Straights', type: 'flat_straight', val: 25, req: 5, prereq: 'm_sch_1' },
            { id: 'm_sch_4', row: 3, col: 2, name: 'Efficiency', max: 5, desc: '+15 Base Dmg', type: 'flat_global', val: 15, req: 10 },
            { id: 'm_sch_5', row: 4, col: 2, name: 'Arcane Binding', max: 5, desc: 'Enchantments are +20% stronger', type: 'synergy_enchant', val: 0.20, req: 15, prereq: 'm_sch_4' },
            { id: 'm_sch_6', row: 5, col: 1, name: 'Mastermind', max: 1, desc: '+50% Lg Straight', type: 'mult_straight_lg', val: 50, req: 20 },
            { id: 'm_sch_7', row: 5, col: 3, name: 'Concentration', max: 3, desc: '+10% Dmg per Unused Roll', type: 'dynamic_unused_rolls', val: 10, req: 20 },
            { id: 'm_sch_8', row: 6, col: 2, name: 'Omniscience', max: 5, desc: '+20% Global Dmg', type: 'mult_global', val: 20, req: 25, prereq: 'm_sch_5' },
            { id: 'm_sch_9', row: 7, col: 2, name: 'Time Warp', max: 3, desc: '+150 Flat Lg Straight', type: 'flat_straight_lg', val: 150, req: 30, prereq: 'm_sch_8' },
            { id: 'm_sch_10', row: 8, col: 2, name: 'Archmage', max: 1, desc: '+2 Max Rerolls', type: 'meta_max_rolls', val: 2, req: 40, prereq: 'm_sch_9' }
        ] 
    },
    invoker: { 
        name: "Invoker", 
        icon: <Zap/>, 
        talents: [
            { id: 'm_inv_1', row: 1, col: 2, name: 'Spark', max: 5, desc: '+8 Base Dmg', type: 'flat_global', val: 8, req: 0 },
            { id: 'm_inv_2', row: 2, col: 2, name: 'Overload', max: 5, desc: '+30 Flat FullHouse', type: 'flat_fullhouse', val: 30, req: 5, prereq: 'm_inv_1' },
            { id: 'm_inv_3', row: 3, col: 1, name: 'Static', max: 5, desc: '+20 Flat Pair', type: 'flat_pair', val: 20, req: 10 },
            { id: 'm_inv_4', row: 3, col: 3, name: 'Conductivity', max: 5, desc: '+20% Multiples', type: 'mult_kind', val: 20, req: 10 },
            { id: 'm_inv_5', row: 4, col: 2, name: 'Chain Lightning', max: 3, desc: '+50 Flat 3-Kind', type: 'flat_triple', val: 50, req: 15, prereq: 'm_inv_2' },
            { id: 'm_inv_6', row: 5, col: 2, name: 'Thunderstorm', max: 5, desc: '+100 Flat 4-Kind', type: 'flat_quad', val: 100, req: 20, prereq: 'm_inv_5' },
            { id: 'm_inv_7', row: 6, col: 2, name: 'Lightning Rod', max: 5, desc: '+30% Full House', type: 'mult_fullhouse', val: 30, req: 25, prereq: 'm_inv_6' },
            { id: 'm_inv_8', row: 7, col: 1, name: 'Supercharge', max: 5, desc: '+20% Global Dmg', type: 'mult_global', val: 20, req: 30 },
            { id: 'm_inv_9', row: 8, col: 2, name: 'Stormborn', max: 1, desc: '+150% Pentastrike', type: 'mult_yahtzee', val: 150, req: 40, prereq: 'm_inv_7' }
        ] 
    },
    warlock: { 
        name: "Warlock", 
        icon: <Ghost/>, 
        talents: [
            { id: 'm_war_1', row: 1, col: 2, name: 'Soul Drain', max: 5, desc: 'Gold Find +5%', type: 'meta_gold', val: 0.05, req: 0 },
            { id: 'm_war_2', row: 2, col: 2, name: 'Chaos Bolt', max: 5, desc: '+50 Flat Chance', type: 'flat_chance', val: 50, req: 5, prereq: 'm_war_1' },
            { id: 'm_war_3', row: 3, col: 1, name: 'Dark Pact', max: 5, desc: '+15% Global Dmg', type: 'mult_global', val: 15, req: 10 },
            { id: 'm_war_4', row: 3, col: 3, name: 'Sacrifice', max: 3, desc: '+20% Chance Dmg', type: 'mult_chance', val: 20, req: 10 },
            { id: 'm_war_5', row: 4, col: 2, name: 'Shadowburn', max: 1, desc: '+100% Chance Dmg', type: 'mult_chance', val: 100, req: 15, prereq: 'm_war_2' },
            { id: 'm_war_6', row: 5, col: 2, name: 'Cataclysm', max: 5, desc: '+40 Flat 4-Kind', type: 'flat_quad', val: 40, req: 20, prereq: 'm_war_5' },
            { id: 'm_war_7', row: 6, col: 2, name: 'Oblivion', max: 3, desc: '+200 Flat Pentastrike', type: 'flat_yahtzee', val: 200, req: 25, prereq: 'm_war_6' },
            { id: 'm_war_8', row: 7, col: 1, name: 'Grimoire', max: 5, desc: 'Enchantments +25% stronger', type: 'synergy_enchant', val: 0.25, req: 30 },
            { id: 'm_war_9', row: 8, col: 2, name: 'Lich Form', max: 1, desc: '+3 Max Hearts', type: 'meta_max_hearts', val: 3, req: 40, prereq: 'm_war_7' }
        ] 
    }
  },
  rogue: {
    gambler: { 
        name: "Gambler", 
        icon: <Coins/>, 
        talents: [
            { id: 'r_gam_1', row: 1, col: 2, name: 'Lucky', max: 5, desc: 'Luck +5%', type: 'meta_luck', val: 0.05, req: 0 },
            { id: 'r_gam_2', row: 2, col: 2, name: 'High Roller', max: 5, desc: '+50% Chance Dmg', type: 'mult_chance', val: 50, req: 5, prereq: 'r_gam_1' },
            { id: 'r_gam_3', row: 3, col: 1, name: 'Hot Streak', max: 5, desc: '+10 Base Dmg', type: 'flat_global', val: 10, req: 10 },
            { id: 'r_gam_4', row: 3, col: 3, name: 'Cheat Death', max: 3, desc: '+1% Dmg per 100g', type: 'dynamic_gold', val: 1, req: 10 },
            { id: 'r_gam_5', row: 4, col: 2, name: 'Jackpot', max: 1, desc: '+100% Gold Find', type: 'meta_gold', val: 1.0, req: 15, prereq: 'r_gam_2' },
            { id: 'r_gam_6', row: 5, col: 2, name: 'All In', max: 5, desc: '+25% Pentastrike', type: 'mult_yahtzee', val: 25, req: 20, prereq: 'r_gam_5' },
            { id: 'r_gam_7', row: 6, col: 2, name: 'Snake Eyes', max: 5, desc: '+20% Pair Dmg', type: 'mult_pair', val: 20, req: 25, prereq: 'r_gam_6' },
            { id: 'r_gam_8', row: 7, col: 2, name: 'Ace in the Hole', max: 3, desc: '+5% Dmg per 100g', type: 'dynamic_gold', val: 5, req: 30, prereq: 'r_gam_7' },
            { id: 'r_gam_9', row: 8, col: 2, name: 'Tycoon', max: 1, desc: '+200% Gold Find', type: 'meta_gold', val: 2.0, req: 40, prereq: 'r_gam_8' }
        ] 
    },
    ninja: { 
        name: "Ninja", 
        icon: <Target/>, 
        talents: [
            { id: 'r_nin_1', row: 1, col: 2, name: 'Shuriken', max: 5, desc: '+10 Flat Pair', type: 'flat_pair', val: 10, req: 0 },
            { id: 'r_nin_2', row: 2, col: 1, name: 'Precision', max: 5, desc: '+20 Flat Straights', type: 'flat_straight', val: 20, req: 5, prereq: 'r_nin_1' },
            { id: 'r_nin_3', row: 2, col: 3, name: 'Calculated', max: 3, desc: '+1 Max Reroll', type: 'meta_max_rolls', val: 1, req: 5, prereq: 'r_nin_1' },
            { id: 'r_nin_4', row: 3, col: 2, name: 'Lethality', max: 5, desc: '+15% Global Dmg', type: 'mult_global', val: 15, req: 10 },
            { id: 'r_nin_5', row: 4, col: 2, name: 'Lapidary', max: 5, desc: 'Socketed Gems are +20% stronger', type: 'synergy_gem', val: 0.20, req: 15, prereq: 'r_nin_4' },
            { id: 'r_nin_6', row: 5, col: 1, name: 'Execution', max: 1, desc: '+50% Straights', type: 'mult_straight', val: 50, req: 20 },
            { id: 'r_nin_7', row: 5, col: 3, name: 'Shadow Step', max: 5, desc: '+25% Full House', type: 'mult_fullhouse', val: 25, req: 20 },
            { id: 'r_nin_8', row: 6, col: 2, name: 'Assassinate', max: 3, desc: '+100% Lg Straight', type: 'mult_straight_lg', val: 100, req: 25, prereq: 'r_nin_5' },
            { id: 'r_nin_9', row: 7, col: 2, name: 'Cat Reflexes', max: 5, desc: '+15% Gem Synergy', type: 'synergy_gem', val: 0.15, req: 30, prereq: 'r_nin_8' },
            { id: 'r_nin_10', row: 8, col: 2, name: 'Nine Lives', max: 1, desc: '+3 Max Hearts', type: 'meta_max_hearts', val: 3, req: 40, prereq: 'r_nin_9' }
        ] 
    },
    scout: { 
        name: "Scout", 
        icon: <Footprints/>, 
        talents: [
            { id: 'r_sco_1', row: 1, col: 2, name: 'Prep', max: 5, desc: '+5 Base Dmg', type: 'flat_global', val: 5, req: 0 },
            { id: 'r_sco_2', row: 2, col: 2, name: 'Skirmisher', max: 5, desc: '+25 Flat Two Pair', type: 'flat_twopair', val: 25, req: 5, prereq: 'r_sco_1' },
            { id: 'r_sco_3', row: 3, col: 1, name: 'Tracker', max: 5, desc: '+10% Scraps', type: 'meta_scraps', val: 0.1, req: 10 },
            { id: 'r_sco_4', row: 3, col: 3, name: 'Ambush', max: 3, desc: '+30% Full House', type: 'mult_fullhouse', val: 30, req: 10 },
            { id: 'r_sco_5', row: 4, col: 2, name: 'Survivalist', max: 1, desc: 'Recover 1 Heart on Chance', type: 'sustain_chance', val: 1, req: 15, prereq: 'r_sco_2' },
            { id: 'r_sco_6', row: 5, col: 2, name: 'Vanish', max: 5, desc: '+20% Chance Dmg', type: 'mult_chance', val: 20, req: 20, prereq: 'r_sco_5' },
            { id: 'r_sco_7', row: 6, col: 2, name: 'Dead Eye', max: 3, desc: '+50% Global Dmg', type: 'mult_global', val: 50, req: 25, prereq: 'r_sco_6' },
            { id: 'r_sco_8', row: 7, col: 2, name: 'Scavenger', max: 5, desc: '+20% Scraps Found', type: 'meta_scraps', val: 0.20, req: 30, prereq: 'r_sco_7' },
            { id: 'r_sco_9', row: 8, col: 2, name: 'Ranger General', max: 1, desc: '+100 Base Dmg', type: 'flat_global', val: 100, req: 40, prereq: 'r_sco_8' }
        ] 
    }
  }
};

const CLASSES = [
  { id: 'warrior', name: 'Berserker', icon: <Sword size={32} />, allowedWeapons: ['Sword', 'Axe', 'Mace', 'Hammer'], bonuses: { triple: 15, quad: 30, yahtzee: 50 }, dualWield: false, setId: 'warrior_60', desc: 'Masters of brute force and heavy armor.' },
  { id: 'mage', name: 'Sorcerer', icon: <Zap size={32} />, allowedWeapons: ['Staff', 'Wand', 'Orb', 'Grimoire'], bonuses: { full_house: 40, pair: 10, two_pair: 20 }, dualWield: false, setId: 'mage_60', desc: 'Wielders of arcane magic and elemental power.' },
  { id: 'rogue', name: 'Assassin', icon: <Target size={32} />, allowedWeapons: ['Dagger', 'Bow', 'Crossbow', 'Knives'], bonuses: { straight_sm: 25, straight_lg: 35, chance: 15 }, dualWield: true, setId: 'rogue_60', desc: 'Experts in precision, luck and deadly strikes.' }
];

const PARAGON_TALENTS = [{ id: 'para_power', name: 'Infinite Power', icon: <Sword/>, desc: '+1% Dmg', type: 'mult_global', val: 1 }];

const HEIRLOOM_SHOP = [
  { id: 'h_start_sw', name: 'Recruit Sword', type: 'weapon', rarity: 'rare', cost: 2, levelReq: 1, classReq: 'warrior', effects: [{ type: 'FLAT', target: 'pair', value: 20 }, {type: 'MULT', target: 'pair', value: 10}] },
  { id: 'h_start_wa', name: 'Apprentice Wand', type: 'weapon', rarity: 'rare', cost: 2, levelReq: 1, classReq: 'mage', effects: [{ type: 'FLAT', target: 'full_house', value: 30 }, {type: 'MULT', target: 'full_house', value: 10}] },
  { id: 'h_start_da', name: 'Rusty Shiv', type: 'weapon', rarity: 'rare', cost: 2, levelReq: 1, classReq: 'rogue', effects: [{ type: 'FLAT', target: 'straight_sm', value: 20 }, {type: 'MULT', target: 'straight_sm', value: 10}] },
  { id: 'h_adv_ring', name: 'Ring of Vigor', type: 'ring1', rarity: 'epic', cost: 5, levelReq: 10, classReq: 'all', effects: [{ type: 'FLAT', target: 'pair', value: 40 }, { type: 'MULT', target: 'pair', value: 15 }] },
  { id: 'h_com_chest', name: 'Commander Plate', type: 'body', rarity: 'legendary', cost: 10, levelReq: 30, classReq: 'warrior', effects: [{ type: 'MULT', target: 'quad', value: 50 }, { type: 'FLAT', target: 'quad', value: 100 }], specialEffect: LEGENDARY_EFFECTS[0] },
];

const ITEM_SLOTS = { HEAD: 'head', BODY: 'body', GLOVES: 'gloves', BELT: 'belt', BOOTS: 'boots', AMULET: 'amulet', RING1: 'ring1', RING2: 'ring2', WEAPON: 'weapon', OFFHAND: 'offhand' };
const RARITY_COLORS = { common: 'border-stone-400 bg-stone-200 text-stone-900', rare: 'border-blue-500 bg-blue-100 text-blue-900', epic: 'border-purple-600 bg-purple-100 text-purple-900', legendary: 'border-amber-500 bg-amber-100 text-amber-900 shadow-[0_0_15px_rgba(245,158,11,0.4)]', set: 'border-teal-400 bg-teal-900/30 text-teal-200 shadow-[0_0_15px_rgba(45,212,191,0.4)]' };

const INITIAL_SAVE_STATE = { level: 1, xp: 0, currentFloor: 1, highestFloor: 1, talentPoints: 0, talentRanks: {}, soulGems: 0, paragonLevel: 0, paragonPoints: 0, paragonRanks: {}, inventory: [], equipment: { head: null, body: null, gloves: null, belt: null, boots: null, amulet: null, ring1: null, ring2: null, weapon: null, offhand: null }, gold: 0, scraps: 0, potions: {}, activeEffects: {} };

// --- HELPER FUNCTIONS ---
const rollDie = () => Math.ceil(Math.random() * 6);
const getXpForNextLevel = (c) => Math.floor(100 * Math.pow(c, 1.5));
const getParagonXpReq = (p) => Math.floor(50000 * Math.pow(1.1, p));

const getEnemyHP = (lvl) => {
  let base = 100; let growth = Math.pow(1.15, lvl) * 30; 
  if (lvl > 5) growth *= 1.3; if (lvl > 60) growth = Math.pow(1.3, lvl) * 100; 
  let hp = Math.floor(base + growth);
  if (lvl % 5 === 0) hp = Math.floor(hp * 1.8); 
  return hp;
};

// --- NEW LOOT GENERATOR LOGIC WITH FLOOR SCALING ---
const generateLoot = (level, floor, classId, talentLuck = 0, potionLuck = 0) => {
  // Scroll / Gem Drops (Separate Chance)
  if (level >= 30 && Math.random() < 0.1) {
      const types = ['FLAT', 'MULT']; const combos = Object.keys(COMBO_TYPES); const type = types[Math.floor(Math.random()*types.length)]; const target = combos[Math.floor(Math.random()*combos.length)].toLowerCase(); const val = type === 'FLAT' ? Math.floor(level * 2) : Math.floor(5 + level * 0.2);
      return { id: Date.now() + Math.random(), name: `Scroll of ${type === 'FLAT' ? 'Force' : 'Power'}`, type: 'scroll', rarity: 'rare', effect: { type, target, value: val }, value: level * 10 };
  }
  if (level >= 10 && Math.random() < 0.05) {
      const types = ['FLAT', 'MULT']; const combos = Object.keys(COMBO_TYPES); const type = types[Math.floor(Math.random()*types.length)]; const target = combos[Math.floor(Math.random()*combos.length)].toLowerCase(); const val = type === 'FLAT' ? Math.floor(level * 1.5) : Math.floor(3 + level * 0.1);
      return { id: Date.now() + Math.random(), name: `Polished Gem`, type: 'gem', rarity: 'epic', effect: { type, target, value: val }, value: level * 20 };
  }

  // --- RARITY CALCULATION ---
  let legendaryChance = 0;
  let epicChance = 0;
  let rareChance = 0;

  if (floor >= 10) {
      const baseLegendary = 0.05;
      const bonusLegendary = Math.max(0, Math.floor((floor - 10) / 5)) * 0.01; 
      legendaryChance = baseLegendary + bonusLegendary;
      epicChance = 0.15;
      rareChance = 0.30;
  } else if (floor >= 5) {
      rareChance = 0.30;
  } else {
      rareChance = 0;
  }
  
  // Apply Potion Luck (Fortune's Favor)
  if (potionLuck > 0) {
      legendaryChance += potionLuck; 
      epicChance += potionLuck;
  }

  const legThreshold = 1.0 - legendaryChance;
  const epicThreshold = legThreshold - epicChance;
  const rareThreshold = epicThreshold - rareChance;

  const roll = Math.random() + talentLuck;
  let rarity = 'common';
  
  if (roll >= legThreshold && legendaryChance > 0) rarity = 'legendary';
  else if (roll >= epicThreshold && epicChance > 0) rarity = 'epic';
  else if (roll >= rareThreshold && rareChance > 0) rarity = 'rare';
  
  const slots = Object.values(ITEM_SLOTS); 
  const slot = slots[Math.floor(Math.random() * slots.length)]; 
  
  let effects = []; 
  let sockets = 0;
  let specialEffect = null;
  let multiplierScale = 1;
  const levelScaling = 1 + (level * 0.2);

  if (rarity === 'common') {
      const comboKeys = Object.keys(COMBO_TYPES);
      const targetCombo = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const val = Math.floor((Math.random() * 8 + 4) * levelScaling);
      effects.push({ type: 'FLAT', target: targetCombo, value: val });
  }
  else if (rarity === 'rare') {
      multiplierScale = 1.5;
      const comboKeys = Object.keys(COMBO_TYPES);
      const t1 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const t2 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const valFlat = Math.floor((Math.random() * 10 + 6) * multiplierScale * levelScaling);
      effects.push({ type: 'FLAT', target: t1, value: valFlat });
      const valMult = Math.floor((Math.random() * 8 + 4) * multiplierScale);
      effects.push({ type: 'MULT', target: t2, value: valMult });
  }
  else if (rarity === 'epic') {
      multiplierScale = 2.0;
      sockets = Math.random() > 0.7 ? 1 : 0; 
      const comboKeys = Object.keys(COMBO_TYPES);
      const t1 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const t2 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const valFlat = Math.floor((Math.random() * 12 + 8) * multiplierScale * levelScaling);
      effects.push({ type: 'FLAT', target: t1, value: valFlat });
      const valMult = Math.floor((Math.random() * 12 + 6) * multiplierScale);
      effects.push({ type: 'MULT', target: t2, value: valMult });
  }
  else {
      multiplierScale = 3.5;
      sockets = Math.random() > 0.5 ? 2 : 1;
      specialEffect = LEGENDARY_EFFECTS[Math.floor(Math.random() * LEGENDARY_EFFECTS.length)];
      const comboKeys = Object.keys(COMBO_TYPES);
      const t1 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const t2 = comboKeys[Math.floor(Math.random() * comboKeys.length)].toLowerCase();
      const valFlat = Math.floor((Math.random() * 15 + 10) * multiplierScale * levelScaling);
      effects.push({ type: 'FLAT', target: t1, value: valFlat });
      const valMult = Math.floor((Math.random() * 15 + 10) * multiplierScale);
      effects.push({ type: 'MULT', target: t2, value: valMult });
  }

  let isSetItem = false; let setId = null;
  if (level >= 60 && Math.random() > 0.95 && floor >= 10) {
      const heroClass = CLASSES.find(c => c.id === classId);
      if (heroClass && ['head','body','gloves','boots','weapon','offhand'].includes(slot)) { isSetItem = true; rarity = 'set'; setId = heroClass.setId; }
  }

  const weaponList = CLASSES.find(c => c.id === classId)?.allowedWeapons || ['Stick'];
  const names = { [ITEM_SLOTS.WEAPON]: weaponList, [ITEM_SLOTS.HEAD]: ['Helm', 'Hood'], [ITEM_SLOTS.BODY]: ['Plate', 'Robe'], [ITEM_SLOTS.GLOVES]: ['Gloves', 'Mitts'], [ITEM_SLOTS.BELT]: ['Belt', 'Sash'], [ITEM_SLOTS.BOOTS]: ['Boots', 'Shoes'], [ITEM_SLOTS.OFFHAND]: ['Shield', 'Orb'], [ITEM_SLOTS.AMULET]: ['Amulet', 'Necklace'], [ITEM_SLOTS.RING1]: ['Ring', 'Band'], [ITEM_SLOTS.RING2]: ['Ring', 'Band'] };
  const nameBase = slot.includes('ring') ? names[ITEM_SLOTS.RING1] : names[slot];
  const name = nameBase[Math.floor(Math.random() * nameBase.length)];
  const value = Math.floor((level * 25) * (rarity === 'common' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 5 : 10));

  return { 
      id: Date.now() + Math.random(), 
      name: isSetItem ? SETS[setId].name + " " + name : `${rarity === 'legendary' ? 'Ancient ' : ''}${name}`, 
      type: slot, 
      rarity, 
      effects, 
      value, 
      upgradeLevel: 0, 
      sockets: Array(sockets).fill(null), 
      enchantment: null, 
      setId,
      specialEffect 
  };
};

// --- DAMAGE CALCULATION (NOW WITH DYNAMIC SYNERGIES) ---

const getDamageForCombo = (comboId, equipment, classBonuses, talents, classId, paragonRanks, gameState = {}) => {
    const baseDmg = COMBO_TYPES[comboId.toUpperCase()].baseDmg;
    let flatBonus = 0; let multBonus = 0;
    flatBonus += (classBonuses[comboId] || 0);

    // Calculate Synergy Multipliers First
    let gemSynergy = 1;
    let enchantSynergy = 1;
    let upgradeSynergy = 0.1; // Base 10%

    const trees = TALENT_TREES[classId];
    if (trees) { 
        Object.values(trees).forEach(tree => { 
            tree.talents.forEach(t => { 
                const rank = talents[t.id] || 0; 
                if (rank === 0) return; 
                
                // Static Checks
                if (t.type === 'flat_global') flatBonus += (t.val * rank); 
                else if (t.type === 'mult_global') multBonus += (t.val * rank); 
                else if (t.type.includes('flat') && t.type.includes(comboId.split('_')[0])) flatBonus += (t.val * rank); 
                else if (t.type.includes('mult') && t.type.includes(comboId.split('_')[0])) multBonus += (t.val * rank); 
                
                // Synergy Checks
                else if (t.type === 'synergy_gem') gemSynergy += (t.val * rank);
                else if (t.type === 'synergy_enchant') enchantSynergy += (t.val * rank);
                else if (t.type === 'synergy_upgrade') upgradeSynergy += (t.val * rank);

                // Dynamic Synergy Checks
                else if (t.type === 'dynamic_missing_hearts' && gameState.hearts !== undefined) {
                    const maxHearts = gameState.maxHearts || 5;
                    const missing = Math.max(0, maxHearts - gameState.hearts);
                    multBonus += (t.val * rank * missing);
                }
                else if (t.type === 'dynamic_unused_rolls' && gameState.rollsLeft !== undefined) {
                     multBonus += (t.val * rank * gameState.rollsLeft);
                }
                else if (t.type === 'dynamic_gold' && gameState.gold !== undefined) {
                    const stacks = Math.floor(gameState.gold / 100); // Per 100g
                    multBonus += (t.val * rank * stacks);
                }
                else if (t.type === 'dynamic_execute' && gameState.enemyHp !== undefined && gameState.enemyMaxHp !== undefined) {
                    if ((gameState.enemyHp / gameState.enemyMaxHp) <= 0.3) {
                        multBonus += (t.val * rank);
                    }
                }
                else if (t.type === 'dynamic_first_blood' && gameState.isFirstRoll) {
                    multBonus += (t.val * rank);
                }
            }); 
        }); 
    }
    multBonus += (paragonRanks['para_power'] || 0);

    const equippedSetCounts = {}; Object.values(equipment).forEach(item => { if (item && item.setId) { equippedSetCounts[item.setId] = (equippedSetCounts[item.setId] || 0) + 1; } });
    Object.keys(equippedSetCounts).forEach(sId => { const count = equippedSetCounts[sId]; const setDef = SETS[sId]; if(setDef) { setDef.bonuses.forEach(bonus => { if (count >= bonus.pieces) { if (bonus.type === 'flat_global') flatBonus += bonus.val; if (bonus.type === 'mult_global') multBonus += bonus.val; } }); } });

    Object.values(equipment).forEach(item => {
        if(!item) return;
        
        // Warrior Synergy: Upgrade Scaling
        const upgradeMult = 1 + (item.upgradeLevel * upgradeSynergy);
        
        const processEffect = (eff, multiplier = 1) => { 
            if (eff.target === 'ALL' || eff.target === comboId) { 
                const finalVal = eff.value * upgradeMult * multiplier;
                if (eff.type === 'FLAT') flatBonus += finalVal; 
                if (eff.type === 'MULT') multBonus += finalVal; 
            } 
        };

        item.effects?.forEach(e => processEffect(e, 1)); 
        
        // Rogue Synergy: Gem Scaling
        item.sockets?.forEach(gem => { if(gem) processEffect(gem.effect, gemSynergy); });
        
        // Mage Synergy: Enchant Scaling
        if(item.enchantment) processEffect(item.enchantment.effect, enchantSynergy);

        // Legendary Dynamic Effects
        if (item.specialEffect?.id === 'midas' && gameState.gold !== undefined) {
            const stacks = Math.floor(gameState.gold / 50);
            multBonus += stacks;
        }
    });

    let totalDmg = baseDmg + flatBonus;
    const multMultiplier = 1 + (multBonus / 100);
    totalDmg = Math.floor(totalDmg * multMultiplier);
    return { totalDmg, breakdown: { base: baseDmg, flat: flatBonus, mult: multBonus } };
};

const calculateBestScore = (dice, equipment, classBonuses, talents, classId, paragonRanks, gameState) => {
  if (!dice || dice.some(d => d === null)) return { combo: COMBO_TYPES.CHANCE, totalDmg: 0, breakdown: {base:0, flat:0, mult:0} }; 
  const counts = {}; dice.forEach(d => counts[d] = (counts[d] || 0) + 1);
  const freq = Object.values(counts).sort((a, b) => b - a);
  const possibleCombos = ['chance'];
  if (freq[0] >= 2) possibleCombos.push('pair'); if (freq[0] >= 3) possibleCombos.push('triple'); if (freq[0] >= 4) possibleCombos.push('quad'); if (freq[0] === 5) possibleCombos.push('yahtzee'); if (freq[0] >= 2 && freq[1] >= 2) possibleCombos.push('two_pair'); if (freq[0] === 3 && freq[1] === 2) possibleCombos.push('full_house'); if (freq[0] === 5) possibleCombos.push('full_house');
  const unique = Object.keys(counts).map(Number).sort((a, b) => a - b);
  let consecutive = 0, maxConsecutive = 0;
  for (let i = 0; i < unique.length - 1; i++) { if (unique[i+1] === unique[i] + 1) consecutive++; else consecutive = 0; if (consecutive > maxConsecutive) maxConsecutive = consecutive; }
  if (maxConsecutive >= 3) possibleCombos.push('straight_sm'); if (maxConsecutive >= 4) possibleCombos.push('straight_lg');
  let bestResult = { totalDmg: -1 }; let bestComboId = 'chance';
  possibleCombos.forEach(cId => { const res = getDamageForCombo(cId, equipment, classBonuses, talents, classId, paragonRanks, gameState); if (res.totalDmg > bestResult.totalDmg) { bestResult = res; bestComboId = cId; } });
  return { combo: COMBO_TYPES[bestComboId.toUpperCase()], totalDmg: bestResult.totalDmg, breakdown: bestResult.breakdown };
};

const getBaseScoreForType = (typeId, equipment, classBonuses, talents, classId, paragonRanks, gameState) => getDamageForCombo(typeId, equipment, classBonuses, talents, classId, paragonRanks, gameState);

// --- COMPONENTS ---

const Die = ({ value, locked, onClick, rolling }) => (
  <button onClick={value !== null ? onClick : undefined} className={`w-14 h-14 md:w-20 md:h-20 rounded-xl flex items-center justify-center text-3xl font-bold shadow-lg transition-all ${value === null ? 'bg-stone-800 text-stone-600 border-b-4 border-stone-900 cursor-default' : locked ? 'bg-amber-600 text-white border-4 border-amber-800 translate-y-2 ring-2 ring-amber-300' : 'bg-white text-stone-900 border-b-8 border-stone-300 hover:mt-1 hover:border-b-4 active:mt-2 active:border-b-0'} ${rolling ? 'animate-bounce' : ''}`}>
    {rolling ? '?' : (value === null ? '-' : value)}
    {locked && <div className="absolute -top-2 -right-2 bg-amber-800 rounded-full p-1"><Lock size={12} className="text-white"/></div>}
  </button>
);

const ItemCard = ({ item, onClick, isSelected, equipped }) => {
  const getIcon = (type) => {
    if (type === 'currency_scraps') return <Anvil size={20}/>;
    if (type === 'currency_gem') return <Ghost size={20}/>;
    if (type.startsWith('pot_')) return <FlaskConical size={20}/>;
    if (type === 'scroll') return <Scroll size={20}/>; if (type === 'gem') return <Hexagon size={20}/>; if(type.includes('ring')) return <Gem size={20}/>;
    switch(type) { case ITEM_SLOTS.WEAPON: return <Sword size={20}/>; case ITEM_SLOTS.HEAD: return <Crown size={20}/>; case ITEM_SLOTS.BODY: return <Shirt size={20}/>; case ITEM_SLOTS.BOOTS: return <Footprints size={20}/>; case ITEM_SLOTS.OFFHAND: return <Shield size={20}/>; case ITEM_SLOTS.AMULET: return <Star size={20}/>; case ITEM_SLOTS.GLOVES: return <Hand size={20}/>; case ITEM_SLOTS.BELT: return <div className="w-5 h-2 bg-current rounded-full"/>; default: return <Backpack size={20}/>; }
  };
  
  if (!item) return (<div className={`w-14 h-14 rounded-lg border-2 border-dashed border-stone-600 bg-stone-800/30 flex items-center justify-center text-stone-600`}>{equipped && <span className="opacity-20 text-[8px] text-center uppercase tracking-widest">{equipped}</span>}</div>);
  
  // Special Styling for Currency
  if (item.type.startsWith('currency')) {
      return (
        <div className="relative w-14 h-14 rounded-lg bg-stone-900 border border-stone-700 flex flex-col items-center justify-center text-center p-1 shadow-md">
            <div className={item.type === 'currency_gem' ? 'text-purple-400' : 'text-stone-400'}>{getIcon(item.type)}</div>
            <div className="text-[10px] font-bold mt-1 text-white">+{item.value}</div>
        </div>
      )
  }

  // Potion Card
  if (item.type.startsWith('pot_')) {
      return (
        <div className={`relative w-14 h-14 rounded-lg bg-stone-900 border border-stone-700 flex flex-col items-center justify-center text-center p-1 shadow-md cursor-pointer hover:bg-stone-800 transition-colors ${isSelected ? 'ring-2 ring-white' : ''}`} onClick={() => onClick(item)}>
            <div className={`${item.iconColor || 'text-stone-400'}`}>{getIcon(item.type)}</div>
            {item.count > 1 && <div className="absolute top-0 right-0 bg-stone-800 text-white text-[9px] px-1 rounded-bl border-l border-b border-stone-600 font-mono">x{item.count}</div>}
        </div>
      )
  }

  const isHeirloom = item.isHeirloom;
  
  return (
    <div className={`relative w-14 h-14 rounded-lg cursor-pointer transition-all z-10 flex flex-col items-center justify-center text-center p-1 shadow-md 
        ${RARITY_COLORS[item.rarity]} 
        ${isSelected ? 'ring-4 ring-white scale-105 z-20' : ''}`} onClick={() => onClick(item)}>
      <div className="opacity-70">{getIcon(item.type)}</div>
      {item.upgradeLevel > 0 && <div className="absolute -top-1 -left-1 bg-red-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-red-800 z-20">+{item.upgradeLevel}</div>}
      
      {/* HEIRLOOM INDICATOR */}
      {isHeirloom && (
        <div className="absolute -top-1 -left-1 bg-purple-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-purple-800 z-20 shadow-sm" title="Heirloom (Permanent)">
            <Infinity size={10} />
        </div>
      )}
      {/* If Upgrade Level exists, shift it if Heirloom exists, or just stack them? 
          Better yet, let's put upgrade level on Top Left and Heirloom on Top Left but offset, or Bottom Left. 
          Actually, let's put Heirloom on Bottom Left to keep it clean.
      */}
      {isHeirloom && item.upgradeLevel > 0 && (
         // If both exist, keep upgrade top-left, put heirloom bottom-left
         <div className="absolute -bottom-1 -left-1 bg-purple-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-purple-800 z-20 shadow-sm" title="Heirloom (Permanent)">
            <Infinity size={10} />
         </div>
      )}
      {isHeirloom && item.upgradeLevel === 0 && (
          // If only heirloom, top-left is fine
          <div className="absolute -top-1 -left-1 bg-purple-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border border-purple-800 z-20 shadow-sm" title="Heirloom (Permanent)">
            <Infinity size={10} />
         </div>
      )}


      {item.sockets && item.sockets.length > 0 && (<div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5 -mb-1">{item.sockets.map((s, i) => <div key={i} className={`w-2 h-2 rounded-full border border-black ${s ? 'bg-cyan-400' : 'bg-stone-900'}`}></div>)}</div>)}
      {item.type !== 'gem' && item.type !== 'scroll' && (<div className="absolute top-1 right-1 flex flex-col gap-0.5 items-end">{item.effects?.slice(0, 2).map((eff, i) => (<div key={i} className={`text-[8px] px-1 rounded-sm leading-none ${eff.type === 'MULT' ? 'bg-purple-900 text-purple-200' : 'bg-stone-900 text-stone-200'}`}>{eff.type === 'MULT' ? `${eff.value}%` : `+${eff.value}`}</div>))}</div>)}
      {item.specialEffect && <div className="absolute -bottom-1 -right-1 text-[10px] animate-pulse">✨</div>}
    </div>
  );
};

const ComparisonView = ({ selected, equipped, onClose, onAction, actionLabel, isUpgrade, cost, secondAction, secondActionLabel, onSell, onSwitchSlot, currentSlot }) => {
    const renderItemDetails = (item, label) => {
        if (!item) return null;
        // Potion Detail View
        if (item.type.startsWith('pot_')) {
             return (
                <div className="flex-1 bg-stone-900 p-3 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-stone-500 uppercase font-bold">{label}</span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${RARITY_COLORS[item.rarity]}`}>{item.rarity}</div>
                    </div>
                    <h4 className={`font-bold text-sm mb-1 ${item.color}`}>{item.name}</h4>
                    <div className="text-xs text-stone-300">{item.desc}</div>
                    <div className="text-[10px] text-stone-500 mt-2 italic">Consumable (Permanent until used)</div>
                </div>
             )
        }
        if (item.type === 'gem' || item.type === 'scroll') {
             return (
                <div className="flex-1 bg-stone-900 p-3 rounded-xl border border-stone-800">
                    <div className="flex justify-between items-start mb-2"><span className="text-xs text-stone-500 uppercase font-bold">{label}</span><div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${RARITY_COLORS[item.rarity]}`}>{item.rarity}</div></div>
                    <h4 className="font-bold text-sm text-white mb-1">{item.name}</h4>
                    <div className="text-xs text-cyan-400">{item.effect.type === 'MULT' ? `+${item.effect.value}%` : `+${item.effect.value}`} {item.effect.target}</div>
                    <div className="text-[10px] text-stone-500 mt-2 italic">{item.type === 'gem' ? 'Socket into item' : 'Enchant item'}</div>
                </div>
             )
        }
        return (
        <div className="flex-1 bg-stone-900 p-3 rounded-xl border border-stone-800 relative">
             {label === 'Equipped' && onSwitchSlot && selected.type.includes('ring') && (
                <button onClick={onSwitchSlot} className="absolute top-2 right-2 bg-stone-800 hover:bg-stone-700 text-[10px] px-2 py-1 rounded border border-stone-600 flex items-center gap-1 z-20">
                    <Repeat size={10}/> {currentSlot === 'ring1' ? 'Ring 1' : 'Ring 2'}
                </button>
            )}
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-stone-500 uppercase font-bold flex items-center gap-2">
                    {label}
                    {item.isHeirloom && <span className="bg-purple-900 text-purple-200 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 border border-purple-700"><Infinity size={10}/> Heirloom</span>}
                </span>
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold border ${RARITY_COLORS[item.rarity]}`}>{item.rarity}</div>
            </div>
            <h4 className={`font-bold text-sm mb-1 ${item.rarity === 'set' ? 'text-teal-400' : (item.rarity === 'legendary' ? 'text-amber-500' : 'text-white')}`}>{item.upgradeLevel > 0 && `+${item.upgradeLevel} `}{item.name}</h4>
            <div className="space-y-1 mb-2">
                {item.effects?.map((eff, i) => (<div key={i} className={`text-xs ${eff.type === 'MULT' ? 'text-purple-400' : 'text-green-400'}`}>{eff.type === 'MULT' ? `+${eff.value}%` : `+${eff.value}`} {eff.target === 'ALL' ? 'Global' : COMBO_TYPES[eff.target.toUpperCase()]?.name}</div>))}
                {item.sockets?.map((s, i) => (<div key={`sock-${i}`} className="text-[10px] text-cyan-600 flex items-center gap-1"><Hexagon size={8}/> {s ? `+${s.effect.value} ${s.effect.target}` : 'Empty Socket'}</div>))}
                {item.enchantment && (<div className="text-[10px] text-orange-400"><Scroll size={8} className="inline"/> {item.enchantment.name} (+{item.enchantment.effect.value} {item.enchantment.effect.target})</div>)}
                {item.specialEffect && (
                    <div className="mt-2 p-2 bg-amber-900/20 border border-amber-700/50 rounded-lg">
                        <div className="text-xs font-bold text-amber-500 flex items-center gap-1"><Sparkles size={10}/> {item.specialEffect.name}</div>
                        <div className="text-[10px] text-amber-200/80">{item.specialEffect.desc}</div>
                    </div>
                )}
            </div>
            <div className="text-[10px] text-stone-600">Value: {item.value}g</div>
        </div>
    )};

    // Safety Check: if selected is currency, don't show standard comparison
    if (selected.type.startsWith('currency')) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 p-4 shadow-2xl z-50 animate-in slide-in-from-bottom-10 safe-area-pb pb-10">
            <div className="flex gap-2 mb-4">
                {equipped ? renderItemDetails(equipped, "Equipped") : (
                     <div className="flex-1 bg-stone-900 p-3 rounded-xl border border-stone-800 border-dashed flex flex-col items-center justify-center text-stone-600">
                        {onSwitchSlot && selected.type.includes('ring') && (
                            <button onClick={onSwitchSlot} className="mb-2 bg-stone-800 hover:bg-stone-700 text-[10px] px-2 py-1 rounded border border-stone-600 flex items-center gap-1">
                                <Repeat size={10}/> {currentSlot === 'ring1' ? 'Ring 1' : 'Ring 2'}
                            </button>
                        )}
                        <span className="text-xs font-bold uppercase">Empty Slot</span>
                     </div>
                )}
                {renderItemDetails(selected, "Selected")}
            </div>
            <div className="flex gap-3">
                <button onClick={onClose} className="p-3 rounded-xl bg-stone-800 text-stone-400"><X/></button>
                {onSell && <button onClick={onSell} className="bg-red-900/50 text-red-200 border border-red-900 px-4 rounded-xl font-bold text-sm">Sell ({Math.floor(selected.value*0.5)}g)</button>}
                {secondAction && <button onClick={secondAction} className="flex-1 bg-cyan-700 text-white py-3 rounded-xl font-bold text-sm">{secondActionLabel}</button>}
                <button onClick={onAction} className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${isUpgrade ? 'bg-orange-600 text-white' : 'bg-green-700 text-white'}`}>{actionLabel} {cost && <span className="text-xs font-normal opacity-80">({cost})</span>}</button>
            </div>
        </div>
    )
}

const PotionInventory = ({ potions, onClose, onDrink }) => {
    const potionList = Object.entries(potions).filter(([_, count]) => count > 0).map(([id, count]) => {
        const def = Object.values(POTIONS).find(p => p.id === id);
        return { ...def, count };
    });

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-stone-900 border-2 border-stone-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative">
                <div className="bg-stone-800 p-4 border-b border-stone-700 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2"><FlaskConical/> Potion Stash</h3>
                    <button onClick={onClose} className="text-stone-400 hover:text-white"><X/></button>
                </div>
                <div className="p-6">
                    {potionList.length === 0 ? (
                        <div className="text-center text-stone-500 py-8 italic">Your potion belt is empty.</div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {potionList.map(p => (
                                <div key={p.id} className="flex items-center gap-4 bg-stone-950 p-3 rounded-xl border border-stone-800">
                                    <div className={`p-3 rounded-lg bg-stone-900 border border-stone-700 ${p.iconColor}`}><FlaskConical size={24}/></div>
                                    <div className="flex-1">
                                        <div className={`font-bold ${p.color}`}>{p.name} <span className="text-xs text-stone-500 ml-1">x{p.count}</span></div>
                                        <div className="text-xs text-stone-400">{p.desc}</div>
                                    </div>
                                    <button onClick={() => onDrink(p)} className="bg-stone-800 hover:bg-stone-700 text-white px-4 py-2 rounded-lg font-bold text-xs border border-stone-600">Drink</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-stone-950 p-4 border-t border-stone-800 text-center text-xs text-stone-500">
                    Effects last until you die or return to the menu.
                </div>
            </div>
        </div>
    )
}

const HeirloomShop = ({ level, activeClassId, soulGems, buyHeirloom, ownedIds, lockedId, lockItem, refreshShop, shopStock, rerollCost, onSelect }) => {
    return (
        <div className="space-y-6">
            <div className="bg-stone-900 p-4 rounded-xl border border-stone-800 flex justify-between items-center"><div><h3 className="font-bold text-white">Daily Selection</h3><p className="text-xs text-stone-500">Refreshes after every run.</p></div><button onClick={refreshShop} className="bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"><RefreshCw size={14}/> Reroll ({rerollCost} Gems)</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shopStock.map((item) => {
                    const isOwned = ownedIds.includes(item.name); const isLocked = lockedId === item.id; const canAfford = soulGems >= item.cost;
                    return (<div key={item.id} className={`relative bg-stone-900 p-4 rounded-xl border ${isLocked ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'border-stone-800'} flex justify-between items-center transition-all hover:border-stone-700 cursor-pointer`} onClick={() => onSelect(item)}><button onClick={(e) => {e.stopPropagation(); lockItem(item.id);}} className={`absolute top-2 right-2 p-2 rounded-full ${isLocked ? 'text-amber-500 bg-amber-900/20' : 'text-stone-600 hover:text-stone-400'}`}>{isLocked ? <LockIcon size={14} fill="currentColor"/> : <Unlock size={14}/>}</button><div className="flex items-center gap-4"><div className={`w-12 h-12 flex items-center justify-center rounded-lg border ${RARITY_COLORS[item.rarity]}`}>{item.type === 'weapon' ? <Sword size={20}/> : <Star size={20}/>}</div><div><div className={`text-sm font-bold ${item.rarity === 'legendary' ? 'text-amber-500' : 'text-purple-300'}`}>{item.name}</div><div className="text-[10px] text-stone-500 flex flex-col"><span>Req Lvl {item.levelReq || 1}</span>{item.effects?.map((e, i) => (<span key={i} className="text-stone-400">{e.type === 'FLAT' ? '+' : ''}{e.value}{e.type === 'MULT' ? '%' : ''} {e.target}</span>))}</div></div></div><div className={`px-4 py-2 rounded-lg font-bold text-xs mt-6 ${isOwned ? 'bg-stone-800 text-stone-600' : (canAfford ? 'bg-purple-600 text-white' : 'bg-stone-800 text-stone-500')}`}>{isOwned ? 'Owned' : `${item.cost} Gems`}</div></div>)
                })}
            </div>
        </div>
    )
};

// --- MAIN GAME ---

export default function DiceRPG() {
  const [screen, setScreen] = useState('select');
  const [heirloomInventory, setHeirloomInventory] = useState([]); 
  const [shopStock, setShopStock] = useState([]);
  const [lockedShopItemId, setLockedShopItemId] = useState(null);

  const [saves, setSaves] = useState({
    warrior: JSON.parse(JSON.stringify(INITIAL_SAVE_STATE)),
    mage: JSON.parse(JSON.stringify(INITIAL_SAVE_STATE)),
    rogue: JSON.parse(JSON.stringify(INITIAL_SAVE_STATE))
  });
  const [activeClassId, setActiveClassId] = useState(null);
  
  // Talent State
  const [talentTab, setTalentTab] = useState(0);
  const [selectedTalent, setSelectedTalent] = useState(null); 
  const [pendingRanks, setPendingRanks] = useState(null); 
  
  // Potion State
  const [showPotionInv, setShowPotionInv] = useState(false);

  const [compareRingSlot, setCompareRingSlot] = useState('ring1');

  const [runLevel, setRunLevel] = useState(1);
  const [startFloor, setStartFloor] = useState(1); 
  
  const [enemy, setEnemy] = useState(null);
  const [hearts, setHearts] = useState(5); 
  const [maxHearts, setMaxHearts] = useState(5); 
  const [isFirstRoll, setIsFirstRoll] = useState(true);

  const [rollsLeft, setRollsLeft] = useState(3);
  const [maxRolls, setMaxRolls] = useState(3); 

  const [dice, setDice] = useState([null, null, null, null, null]); 
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [rolling, setRolling] = useState(false);
  const [dmgPopup, setDmgPopup] = useState(null);
  const [vendorItems, setVendorItems] = useState([]);
  const [lastRunXp, setLastRunXp] = useState(0);
  
  const [lootBoxRewards, setLootBoxRewards] = useState(null);
  const [isLootBoxOpen, setIsLootBoxOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showStats, setShowStats] = useState(false);

  const activeSave = activeClassId ? saves[activeClassId] : null;
  const heroClass = activeClassId ? CLASSES.find(c => c.id === activeClassId) : null;
  const accountBoundUnlocked = useMemo(() => Object.values(saves).some(s => s.level >= 60), [saves]);

  const getAvailableGems = (classId) => accountBoundUnlocked ? Object.values(saves).reduce((acc, s) => acc + s.soulGems, 0) : saves[classId].soulGems;
  const updateActiveSave = (updates) => setSaves(prev => ({ ...prev, [activeClassId]: { ...prev[activeClassId], ...updates } }));

  // --- SHOP LOGIC ---
  const generateShopStock = (level) => {
      const newStock = []; const slots = lockedShopItemId ? 5 : 6; 
      if (lockedShopItemId) { const lockedItem = shopStock.find(i => i.id === lockedShopItemId); if (lockedItem) newStock.push(lockedItem); }
      for(let i=0; i<slots; i++) {
          const validItems = HEIRLOOM_SHOP.filter(i => i.levelReq <= level + 20 && (i.classReq === 'all' || i.classReq === activeClassId));
          const pool = validItems.length > 0 ? validItems : HEIRLOOM_SHOP.filter(i => i.classReq === 'all');
          const randomItem = pool[Math.floor(Math.random() * pool.length)];
          if(randomItem) newStock.push({...randomItem, id: randomItem.id + Math.random()}); 
      }
      return newStock;
  };
  const refreshHeirloomShop = (manual = false) => {
      const cost = 1 + Math.floor((activeSave ? activeSave.level : 1) / 10);
      const gems = activeClassId ? getAvailableGems(activeClassId) : getAvailableGems('warrior');
      if (manual) { if (gems < cost) return; spendGems(cost); }
      setShopStock(generateShopStock(activeSave ? activeSave.level : 1));
  };
  const toggleShopLock = (itemId) => { if (lockedShopItemId === itemId) { setLockedShopItemId(null); } else { setLockedShopItemId(itemId); }};

  const showToast = (msg) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, msg }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2000);
  };

  // --- CORE ACTIONS ---
  const spendGems = (cost) => {
      if (!accountBoundUnlocked) { updateActiveSave({ soulGems: activeSave.soulGems - cost }); } else {
          let remainingCost = cost; const newSaves = { ...saves };
          if (newSaves[activeClassId].soulGems >= remainingCost) { newSaves[activeClassId].soulGems -= remainingCost; remainingCost = 0; } else { remainingCost -= newSaves[activeClassId].soulGems; newSaves[activeClassId].soulGems = 0; }
          if (remainingCost > 0) { Object.keys(newSaves).forEach(key => { if (remainingCost > 0 && key !== activeClassId) { if (newSaves[key].soulGems >= remainingCost) { newSaves[key].soulGems -= remainingCost; remainingCost = 0; } else { remainingCost -= newSaves[key].soulGems; newSaves[key].soulGems = 0; } } }); }
          setSaves(newSaves);
      }
  };

  const addXp = (amount) => {
    if (!activeSave) return;
    let xpMultiplier = 1;
    // Potion Buff
    if (activeSave.activeEffects?.buff_xp) xpMultiplier *= activeSave.activeEffects.buff_xp;
    
    Object.values(activeSave.equipment).forEach(item => {
        if (item?.specialEffect?.id === 'scholar') xpMultiplier += item.specialEffect.val;
    });
    
    amount = Math.floor(amount * xpMultiplier);

    if (activeSave.level >= 60) {
        let currentXp = activeSave.xp + amount;
        let currentPara = activeSave.paragonLevel;
        let pointsToAdd = 0;
        while(currentXp >= getParagonXpReq(currentPara)) { currentXp -= getParagonXpReq(currentPara); currentPara++; pointsToAdd++; }
        updateActiveSave({ xp: currentXp, paragonLevel: currentPara, paragonPoints: activeSave.paragonPoints + pointsToAdd });
        return;
    }
    let currentXp = activeSave.xp + amount;
    let currentLvl = activeSave.level;
    let pointsToAdd = 0;
    while (currentXp >= getXpForNextLevel(currentLvl)) { currentXp -= getXpForNextLevel(currentLvl); currentLvl++; pointsToAdd++; }
    if (currentLvl >= 60) { currentLvl = 60; currentXp = 0; }
    updateActiveSave({ xp: currentXp, level: currentLvl, talentPoints: activeSave.talentPoints + pointsToAdd });
  };

  const updateGlobalHeirloom = (upgradedItem) => {
      setHeirloomInventory(prev => prev.map(h => h.name === upgradedItem.name ? { ...h, upgradeLevel: upgradedItem.upgradeLevel } : h));
  };

  const buyHeirloom = () => {
    const item = selectedItem.item;
    const available = activeClassId ? getAvailableGems(activeClassId) : getAvailableGems('warrior');
    if (available >= item.cost) {
        spendGems(item.cost);
        const newItem = { ...item, id: Date.now(), value: 0, upgradeLevel: 0 }; 
        setHeirloomInventory(prev => [...prev, newItem]);
        setSelectedItem(null);
    }
  };

  // --- UPDATED RESET RUN LOGIC TO HANDLE PERMANENT ITEMS ---
  const resetRun = () => {
      let currentInventory = [...heirloomInventory]; 
      let pendingScraps = 0;
      let pendingGems = 0;
      let newPotions = { ...activeSave.potions }; // Copy existing potions

      // FIX: ALWAYS process lootBoxRewards, even if already opened
      if (lootBoxRewards) {
          lootBoxRewards.forEach(reward => {
              if (reward.type === 'currency_scraps') pendingScraps += reward.value;
              else if (reward.type === 'currency_gem') pendingGems += reward.value;
              else if (reward.type.startsWith('pot_')) {
                  // Add potion to inventory
                  newPotions[reward.id] = (newPotions[reward.id] || 0) + 1;
              }
              else {
                  // Add class restriction to heirlooms
                  currentInventory.push({ ...reward, classRestriction: activeClassId });
              }
          });
          
          // Only show toast if box wasn't opened
          if (!isLootBoxOpen) {
              showToast(`Recovered ${lootBoxRewards.length} items!`);
          }
          
          setHeirloomInventory(currentInventory); // Update global inventory state
      }

      let starterWeaponType = 'Sword'; if(activeClassId === 'mage') starterWeaponType = 'Wand'; if(activeClassId === 'rogue') starterWeaponType = 'Dagger';
      const starterWeapon = { id: `start_${Date.now()}`, name: `Rusty ${starterWeaponType}`, type: ITEM_SLOTS.WEAPON, rarity: 'common', effects: [{ type: 'FLAT', target: 'pair', value: 10 }], value: 5, upgradeLevel: 0, sockets:[], enchantment:null };
      const newEquip = { head: null, body: null, gloves: null, belt: null, boots: null, amulet: null, ring1: null, ring2: null, weapon: starterWeapon, offhand: null };
      
      const validHeirlooms = currentInventory.filter(h => !h.classRestriction || h.classRestriction === activeClassId);
      const heirloomCopies = validHeirlooms.map(h => ({...h, id: Date.now() + Math.random()})); 
      
      // Preserve existing scraps/gems and add new ones
      updateActiveSave({ 
          gold: 0, 
          inventory: [...heirloomCopies], 
          equipment: newEquip, 
          currentFloor: 1,
          scraps: activeSave.scraps + pendingScraps,
          soulGems: activeSave.soulGems + pendingGems,
          potions: newPotions,
          activeEffects: {} // Clear potion buffs on reset
      });
      
      refreshHeirloomShop(false);
      setRunLevel(1);
      setStartFloor(1); 
      setScreen('hub');
      setLootBoxRewards(null);
      setIsLootBoxOpen(false);
  };

  const startRun = (classId) => {
    setActiveClassId(classId);
    const save = saves[classId];
    
    if (save.level === 1 && save.xp === 0 && save.currentFloor === 1 && save.inventory.length === 0 && !save.equipment.weapon) {
        let starterWeaponType = 'Sword'; if(classId === 'mage') starterWeaponType = 'Wand'; if(classId === 'rogue') starterWeaponType = 'Dagger';
        const starterWeapon = { id: `start_${Date.now()}`, name: `Rusty ${starterWeaponType}`, type: ITEM_SLOTS.WEAPON, rarity: 'common', effects: [{ type: 'FLAT', target: 'pair', value: 10 }], value: 5, upgradeLevel: 0, sockets:[], enchantment:null };
        
        const validHeirlooms = heirloomInventory.filter(h => !h.classRestriction || h.classRestriction === classId);
        const heirloomCopies = validHeirlooms.map(h => ({...h, id: Date.now() + Math.random()}));
        
        setSaves(prev => ({ 
            ...prev, 
            [classId]: { 
                ...prev[classId], 
                inventory: [...heirloomCopies], 
                equipment: { ...prev[classId].equipment, weapon: starterWeapon },
                currentFloor: 1 
            } 
        }));
        setRunLevel(1);
        setStartFloor(1);
    } else {
        setRunLevel(save.currentFloor || 1);
        setStartFloor(save.currentFloor || 1);
    }
    setScreen('hub');
  };
  
  useEffect(() => {
      if (screen === 'heirlooms' && activeClassId) {
           if (shopStock.length === 0 || (shopStock[0].classReq && shopStock[0].classReq !== 'all' && shopStock[0].classReq !== activeClassId)) {
               setShopStock(generateShopStock(activeSave ? activeSave.level : 1));
           }
      }
      setSelectedItem(null);
  }, [screen, activeClassId]);

  // --- TALENT LOGIC ---
  useEffect(() => {
      if (screen === 'talents' && activeSave) {
          setPendingRanks({ ...activeSave.talentRanks });
      } else {
          setPendingRanks(null);
          setSelectedTalent(null);
      }
  }, [screen, activeClassId]);

  const getPendingTreePoints = (treeKey) => {
      if (!pendingRanks) return 0;
      const tree = TALENT_TREES[activeClassId][treeKey];
      return tree.talents.reduce((sum, t) => sum + (pendingRanks[t.id] || 0), 0);
  };

  const isTalentReachable = (talent, treeKey) => {
      if (!pendingRanks) return false;
      const treePoints = getPendingTreePoints(treeKey);
      const parentMaxed = !talent.prereq || ((pendingRanks[talent.prereq] || 0) === TALENT_TREES[activeClassId][treeKey].talents.find(p => p.id === talent.prereq).max);
      return treePoints >= talent.req && parentMaxed;
  };

  const handleTalentChange = (talent, delta, treeKey) => {
      if (!pendingRanks) return;
      const currentRank = pendingRanks[talent.id] || 0;
      const newRank = currentRank + delta;
      if (newRank < 0 || newRank > talent.max) return;

      const savedSum = Object.values(activeSave.talentRanks).reduce((a, b) => a + b, 0);
      const totalPool = activeSave.talentPoints + savedSum;
      const pendingSum = Object.values(pendingRanks).reduce((a, b) => a + b, 0);
      const pendingUnspent = totalPool - pendingSum;

      if (delta > 0 && pendingUnspent <= 0) return; 
      if (delta > 0 && !isTalentReachable(talent, treeKey)) return;
      if (delta < 0) {
          const tree = TALENT_TREES[activeClassId][treeKey];
          const hasDependentChild = tree.talents.some(t => t.prereq === talent.id && (pendingRanks[t.id] || 0) > 0);
          if (hasDependentChild) { showToast("Cannot unlearn: Dependent talents exist!"); return; }
      }
      setPendingRanks(prev => ({ ...prev, [talent.id]: newRank }));
  };

  const applyTalents = () => {
      if (!pendingRanks) return;
      const savedSum = Object.values(activeSave.talentRanks).reduce((a, b) => a + b, 0);
      const totalPool = activeSave.talentPoints + savedSum;
      const pendingSum = Object.values(pendingRanks).reduce((a, b) => a + b, 0);
      const newUnspent = totalPool - pendingSum;
      updateActiveSave({ talentRanks: pendingRanks, talentPoints: newUnspent });
      showToast("Talents Saved!");
      setSelectedTalent(null);
  };

  // --- ITEM ACTIONS ---
  const handleApplyConsumable = (consumable, targetItem) => {
      let updatedItem = { ...targetItem }; let success = false;
      if (consumable.type === 'gem') { const emptyIdx = updatedItem.sockets.findIndex(s => s === null); if (emptyIdx !== -1) { updatedItem.sockets[emptyIdx] = consumable; success = true; } } 
      else if (consumable.type === 'scroll') { updatedItem.effects = [...updatedItem.effects, consumable.effect]; updatedItem.enchantment = consumable; success = true; }
      if (success) {
          let newEquip = { ...activeSave.equipment }; let newInv = [...activeSave.inventory];
          const equipKey = Object.keys(newEquip).find(k => newEquip[k] && newEquip[k].id === targetItem.id);
          if (equipKey) { newEquip[equipKey] = updatedItem; } else { newInv = newInv.map(i => i.id === targetItem.id ? updatedItem : i); }
          newInv = newInv.filter(i => i.id !== consumable.id);
          updateActiveSave({ equipment: newEquip, inventory: newInv }); setSelectedItem(null);
      }
  };
  const handleEquip = () => { if (!selectedItem) return; const item = selectedItem.item; let targetSlot = item.type; if (item.type.includes('ring')) { targetSlot = compareRingSlot; } if (activeClassId === 'rogue' && item.type === ITEM_SLOTS.WEAPON) { if (activeSave.equipment.weapon && !activeSave.equipment.offhand) { targetSlot = 'offhand'; } else if (activeSave.equipment.weapon && activeSave.equipment.offhand) { targetSlot = 'weapon'; } } const currentEquipped = activeSave.equipment[targetSlot]; const newInv = activeSave.inventory.filter(i => i.id !== item.id); if (currentEquipped) newInv.push(currentEquipped); const newEquip = { ...activeSave.equipment, [targetSlot]: item }; updateActiveSave({ equipment: newEquip, inventory: newInv }); setSelectedItem(null); };
  const handleUnequip = () => { if (!selectedItem) return; const newEquip = { ...activeSave.equipment, [selectedItem.slot]: null }; updateActiveSave({ equipment: newEquip, inventory: [...activeSave.inventory, selectedItem.item] }); setSelectedItem(null); };
  const handleSell = () => { if (!selectedItem) return; const sellPrice = Math.floor(selectedItem.item.value * 0.5); const scrapValue = Math.floor(1 + (selectedItem.item.value / 100) + (selectedItem.item.upgradeLevel)); const newInv = activeSave.inventory.filter(i => i.id !== selectedItem.item.id); updateActiveSave({ gold: activeSave.gold + sellPrice, scraps: activeSave.scraps + scrapValue, inventory: newInv }); setSelectedItem(null); };
  const handleUpgrade = () => { if (!selectedItem) return; const item = selectedItem.item; const cost = 10 + (item.upgradeLevel * 5); if (activeSave.scraps >= cost) { const upgradedItem = { ...item, upgradeLevel: item.upgradeLevel + 1 }; const newInv = activeSave.inventory.map(i => i.id === item.id ? upgradedItem : i); updateActiveSave({ scraps: activeSave.scraps - cost, inventory: newInv }); setSelectedItem({ ...selectedItem, item: upgradedItem }); const isHeirloom = heirloomInventory.some(h => h.name === item.name); if(isHeirloom) updateGlobalHeirloom(upgradedItem); } };
  const buyVendorItem = () => { const item = selectedItem.item; if (activeSave.gold >= item.value) { const newStock = [...vendorItems]; newStock.splice(vendorItems.findIndex(i => i.id === item.id), 1); setVendorItems(newStock); updateActiveSave({ gold: activeSave.gold - item.value, inventory: [...activeSave.inventory, item] }); setSelectedItem(null); } };
  const handleShopClick = (item, list) => { setSelectedItem({ item, context: 'shop', list }); };
  
  const handleDrinkPotion = (potion) => {
      const newPotions = { ...activeSave.potions };
      if (newPotions[potion.id] > 0) {
          newPotions[potion.id]--;
          const newEffects = { ...activeSave.activeEffects, [potion.type]: potion.val };
          updateActiveSave({ potions: newPotions, activeEffects: newEffects });
          showToast(`Drank ${potion.name}! Effect Active.`);
      }
  };

  const confirmBuy = () => {
      const item = selectedItem.item;
      if (selectedItem.list === 'vendor') {
          if (activeSave.gold >= item.value) {
              const newStock = [...vendorItems]; 
              newStock.splice(vendorItems.findIndex(i => i.id === item.id), 1); 
              setVendorItems(newStock);
              updateActiveSave({ gold: activeSave.gold - item.value, inventory: [...activeSave.inventory, item] });
              setSelectedItem(null);
          }
      } else {
          const available = activeClassId ? getAvailableGems(activeClassId) : getAvailableGems('warrior');
          if (available >= item.cost) {
              spendGems(item.cost);
              
              // 1. Create Master Copy for Heirloom Storage (Persists across resets)
              const newItem = { 
                  ...item, 
                  id: Date.now(), 
                  value: 0, 
                  upgradeLevel: 0, 
                  sockets: [], 
                  enchantment: null,
                  isHeirloom: true,
                  // Ensure we track who can use this
                  classRestriction: item.classReq === 'all' ? null : item.classReq
              }; 
              
              setHeirloomInventory(prev => [...prev, newItem]);
              
              // 2. Add to CURRENT Run Inventory immediately (so player can use it now)
              if (activeClassId && activeSave) {
                 const runItem = { ...newItem, id: Date.now() + Math.random() }; // Unique ID for this run
                 updateActiveSave({ inventory: [...activeSave.inventory, runItem] });
                 showToast("Heirloom added to Bag!");
              }

              setSelectedItem(null);
          }
      }
  };
  
  const getComparisonItem = (item) => { if (!item) return null; if (item.type.includes('ring')) { return activeSave.equipment[compareRingSlot]; } return activeSave.equipment[item.type]; };

  const startCombat = () => { 
      if(!activeSave) return; 
      
      // NEW: Lock Start Floor for this run session once combat starts
      if (runLevel === 1 && startFloor !== 1) setStartFloor(1); 
      // Logic: startFloor is set when using dropdown. If simple progression, it stays same.
      
      const scalingLevel = activeSave.level + (runLevel - 1); 
      const enemyHP = getEnemyHP(scalingLevel); 
      const isBoss = runLevel % 5 === 0; 
      
      let calculatedMaxHearts = 5; let calculatedMaxRolls = 3;
      Object.values(activeSave.equipment).forEach(item => { if (item?.specialEffect?.id === 'hydra') calculatedMaxHearts += item.specialEffect.val; if (item?.specialEffect?.id === 'hourglass') calculatedMaxRolls += item.specialEffect.val; });
      if (activeSave.talentRanks) { Object.values(TALENT_TREES[activeClassId]).forEach(tree => { tree.talents.forEach(t => { if (t.type === 'meta_max_hearts' && activeSave.talentRanks[t.id] > 0) { calculatedMaxHearts += t.val; } if (t.type === 'meta_max_rolls' && activeSave.talentRanks[t.id] > 0) { calculatedMaxRolls += (t.val * activeSave.talentRanks[t.id]); } if (t.type === 'meta_max_hearts_flat' && activeSave.talentRanks[t.id] > 0) { calculatedMaxHearts += t.val; } }); }); }

      setMaxHearts(calculatedMaxHearts); setHearts(calculatedMaxHearts); setMaxRolls(calculatedMaxRolls); setRollsLeft(calculatedMaxRolls);
      setEnemy({ name: isBoss ? `FLOOR ${runLevel} BOSS` : `Floor ${runLevel} Enemy`, hp: enemyHP, maxHp: enemyHP, img: isBoss ? '👹' : '👿', isBoss }); 
      setLocked([false, false, false, false, false]); setDice([null, null, null, null, null]); setScreen('combat'); setIsFirstRoll(true);
  };

  const rollAllDice = (isStartOfRound = false) => { 
      if (!isStartOfRound && rollsLeft <= 0) return; 
      if (!isStartOfRound) { let saveChance = 0; Object.values(activeSave.equipment).forEach(item => { if (item?.specialEffect?.id === 'trickster') saveChance += item.specialEffect.val; }); if (Math.random() < saveChance) { showToast("Trickster saved your roll!"); } else { setRollsLeft(prev => prev - 1); } } else { setRollsLeft(maxRolls - 1); setLocked([false, false, false, false, false]); }
      setRolling(true); if (dice[0] === null) setDice([1,1,1,1,1]); setTimeout(() => { const newDice = dice.map((d, i) => { if (isStartOfRound) return rollDie(); if (locked[i] && d !== null) return d; return rollDie(); }); setDice(newDice); setRolling(false); }, 400); 
  };

  const toggleLock = (index) => { if (rolling || dice[0] === null) return; const newLocked = [...locked]; newLocked[index] = !newLocked[index]; setLocked(newLocked); };
  
  const attack = () => { 
      if (dice[0] === null) return; 
      const currentGameState = { hearts, maxHearts, rollsLeft, gold: activeSave.gold, enemyHp: enemy.hp, enemyMaxHp: enemy.maxHp, isFirstRoll };
      const result = calculateBestScore(dice, activeSave.equipment, heroClass.bonuses || {}, activeSave.talentRanks, activeClassId, activeSave.paragonRanks, currentGameState); 
      const dmg = result.totalDmg; 
      
      let heartChange = -1; 
      const hasVampire = Object.values(activeSave.equipment).some(i => i?.specialEffect?.id === 'vampire');
      const hasLastStand = activeSave.talentRanks['w_van_5'] && activeSave.talentRanks['w_van_5'] > 0;
      if (hasVampire && result.combo.id === 'chance') { heartChange = 0; showToast("Vampire Effect: Free Turn on Chance!"); }
      if (hasLastStand && result.combo.id === 'triple') { heartChange = 0; showToast("Last Stand: Attack blocked!"); }
      const hasVanish = activeSave.talentRanks['r_sco_6'] && activeSave.talentRanks['r_sco_6'] > 0; if (hasVanish && result.combo.id === 'chance') { heartChange = 0; showToast("Vanish: Evaded damage!"); }

      const newHearts = Math.min(maxHearts, hearts + heartChange); setHearts(newHearts); if (heartChange < 0) showToast("-1 Heart");
      setDmgPopup(dmg); setTimeout(() => setDmgPopup(null), 1000); const newEnemyHp = enemy.hp - dmg; 
      
      setIsFirstRoll(false); // No longer first roll

      if (newEnemyHp <= 0) { 
          setTimeout(() => { 
              // Potion Luck Check
              const potionLuck = activeSave.activeEffects?.buff_luck || 0;
              const loot = generateLoot(activeSave.level, runLevel, activeClassId, 0.05, potionLuck); 
              
              let goldReward = Math.floor((Math.random() * 50 + 20) * (activeSave.level * 0.5)); 
              // Potion Gold Check
              if (activeSave.activeEffects?.buff_gold) goldReward = Math.floor(goldReward * activeSave.activeEffects.buff_gold);
              Object.values(activeSave.equipment).forEach(item => { if (item?.specialEffect?.id === 'greed') goldReward = Math.floor(goldReward * (1 + item.specialEffect.val)); });
              
              const xpGain = Math.floor(getXpForNextLevel(activeSave.level) * 0.05 + (runLevel * 15)); addXp(xpGain);
              const nextFloor = runLevel + 1;
              const newHighest = Math.max(activeSave.highestFloor, nextFloor);

              if (enemy.isBoss) { 
                  updateActiveSave({ inventory: [...activeSave.inventory, loot], gold: activeSave.gold + goldReward, soulGems: activeSave.soulGems + 1, currentFloor: nextFloor, highestFloor: newHighest }); 
                  const items = []; for(let i=0; i<6; i++) items.push(generateLoot(activeSave.level, runLevel, activeClassId, 0.1, potionLuck)); setVendorItems(items); setScreen('vendor'); 
              } else { 
                  updateActiveSave({ inventory: [...activeSave.inventory, loot], gold: activeSave.gold + goldReward, currentFloor: nextFloor, highestFloor: newHighest }); setScreen('result_win'); 
              } 
          }, 1000); 
      } else if (newHearts <= 0) { 
          setTimeout(() => { 
              const xpEarned = getXpForNextLevel(activeSave.level) * 0.2 + (runLevel * 80); setLastRunXp(Math.floor(xpEarned)); addXp(Math.floor(xpEarned));
              
              // --- NEW LOOT CACHE LOGIC ---
              const floorsCleared = runLevel - startFloor;
              
              if (floorsCleared > 0) {
                  const rewards = [];
                  
                  // 1. Gear Scaling (1 item per 5 floors cleared, cap at 3)
                  const numGear = Math.min(3, Math.floor(floorsCleared / 5) + 1);
                  
                  // 2. Rarity Scaling based on Player Level
                  // Level < 10: Common/Rare
                  // Level < 30: Common/Rare/Epic
                  // Level 30+: All
                  
                  for(let i=0; i<numGear; i++) {
                      let gear = generateLoot(activeSave.level, runLevel, activeClassId, 0.2);
                      gear.isHeirloom = true; // Mark as perma
                      
                      // DOWNGRADE LOGIC IF LEVEL TOO LOW
                      if (activeSave.level < 10 && (gear.rarity === 'epic' || gear.rarity === 'legendary')) {
                          gear.rarity = 'rare'; // Cap at Rare
                          gear.effects = gear.effects.slice(0, 2); // Reduce stats
                      } else if (activeSave.level < 30 && gear.rarity === 'legendary') {
                          gear.rarity = 'epic';
                      }
                      
                      rewards.push(gear);
                  }

                  // 3. Scraps (Always)
                  let scrapAmount = floorsCleared * Math.floor(Math.random() * 5 + 5);
                  if (activeSave.activeEffects?.buff_scrap) scrapAmount = Math.floor(scrapAmount * activeSave.activeEffects.buff_scrap);
                  rewards.push({ type: 'currency_scraps', value: scrapAmount, name: 'Pile of Scraps', rarity: 'common' });

                  // 4. Soul Gem (Chance)
                  if (Math.random() < (floorsCleared * 0.02)) { // 2% chance per floor cleared
                      rewards.push({ type: 'currency_gem', value: 1, name: 'Soul Gem', rarity: 'legendary' });
                  }

                  // 5. POTION DROP (Rare)
                  // 10% Chance per run completion + bonus for floors
                  if (Math.random() < (0.10 + (floorsCleared * 0.01))) {
                      const roll = Math.random();
                      let pot = null;
                      // 5% Chance for Luck Potion (Extreme Rare)
                      if (roll < 0.05) pot = POTIONS.LUCK;
                      else {
                          const commonPots = [POTIONS.XP, POTIONS.GOLD, POTIONS.SCRAP];
                          pot = commonPots[Math.floor(Math.random() * commonPots.length)];
                      }
                      rewards.push({...pot, type: pot.id});
                  }

                  setLootBoxRewards(rewards);
              } else {
                  setLootBoxRewards(null); // No reward for instant death
              }

              setScreen('result_loss'); 
          }, 1000); 
      } else { setEnemy(prev => ({ ...prev, hp: newEnemyHp })); setRollsLeft(maxRolls); setLocked([false, false, false, false, false]); setDice([null, null, null, null, null]); } 
  };
  const hasRolled = dice[0] !== null;
  const currentGameState = { hearts, maxHearts, rollsLeft, gold: activeSave?.gold || 0, enemyHp: enemy?.hp, enemyMaxHp: enemy?.maxHp, isFirstRoll };
  const currentScore = activeClassId ? calculateBestScore(dice, activeSave?.equipment || {}, heroClass?.bonuses || {}, activeSave?.talentRanks || {}, activeClassId, activeSave?.paragonRanks || {}, currentGameState) : {totalDmg: 0, breakdown: {base:0,flat:0,mult:0}, combo: {name:'-'}};

  // --- HELPER: Get Valid Checkpoints ---
  const getAvailableCheckpoints = () => {
      const checkpoints = [1];
      // Unlocks every 5 floors (after bosses: 6, 11, 16...)
      // Requirement: Player must be high enough level to skip content
      // Logic: Floor 6 requires Level 5. Floor 11 requires Level 10.
      for (let f = 6; f <= activeSave.highestFloor; f += 5) {
          if (activeSave.level >= (f - 1)) {
              checkpoints.push(f);
          }
      }
      return checkpoints;
  };

  // --- RENDER ---
  if (screen === 'select') { 
      return (<div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4"><h1 className="text-4xl md:text-6xl font-black text-amber-500 mb-8 tracking-tighter drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">DICE & DUNGEONS</h1>{accountBoundUnlocked && <div className="text-purple-400 font-bold mb-4 animate-pulse">✨ Shared Soul Gems Unlocked! ✨</div>}<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">{CLASSES.map(c => { 
      const save = saves[c.id]; 
      const xpReq = save.level >= 60 ? getParagonXpReq(save.paragonLevel) : getXpForNextLevel(save.level);
      const xpPercent = (save.xp / xpReq) * 100;
      return (<button key={c.id} onClick={() => startRun(c.id)} className="bg-stone-900 border-2 border-stone-800 hover:border-amber-500 hover:bg-stone-800 p-8 rounded-2xl flex flex-col items-center transition-all group hover:-translate-y-2 relative overflow-hidden">{save.level > 1 && <div className="absolute top-0 right-0 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-bl-xl">Lvl {save.level}</div>}<div className="text-stone-500 group-hover:text-amber-400 mb-4 transition-colors transform scale-125">{c.icon}</div><h2 className="text-2xl font-bold text-white mb-2">{c.name}</h2><div className="text-xs text-stone-500 mb-2 flex items-center gap-1"><Ghost size={12}/> {save.soulGems} Gems</div><p className="text-stone-400 text-sm text-center mb-6">{c.desc}</p>
      <div className="w-full h-2 bg-stone-950 rounded-full mt-auto overflow-hidden border border-stone-800"><div className="h-full bg-cyan-600 transition-all duration-500" style={{width: `${xpPercent}%`}}></div></div><div className="text-[10px] text-stone-500 font-mono mt-1">{Math.floor(xpPercent)}% to Lvl {save.level >= 60 ? save.paragonLevel + 1 : save.level + 1}</div></button>)})}</div></div>); }

  if (screen === 'hub' || screen === 'forge') {
      const isForge = screen === 'forge';
      if (!activeClassId) { setScreen('select'); return null; }
      const xpReq = activeSave.level >= 60 ? getParagonXpReq(activeSave.paragonLevel) : getXpForNextLevel(activeSave.level);
      const xpPercent = (activeSave.xp / xpReq) * 100;
      
      const activePotionCount = Object.keys(activeSave.activeEffects || {}).length;

      return (
        <div className="min-h-screen bg-stone-950 text-stone-200 font-sans pb-40"> 
          <div className="bg-stone-900 border-b border-stone-800 p-4 sticky top-0 z-30 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center w-full md:w-auto justify-between gap-4">
                     <div className="flex items-center gap-2"><button onClick={() => setScreen('select')} className="p-2 bg-stone-800 rounded-full"><LogOut size={16}/></button><div className="bg-stone-800 p-2 rounded-xl border border-stone-700 text-amber-500 shadow-inner">{heroClass.icon}</div><div><h2 className="font-bold text-md text-white leading-tight">{heroClass.name}</h2><div className="text-xs text-stone-500 font-mono">{activeSave.level >= 60 ? <span className="text-cyan-400">Paragon {activeSave.paragonLevel}</span> : `Lvl ${activeSave.level}`} • Floor {runLevel}</div></div></div>
                     <div className="flex-1 md:w-64 flex flex-col justify-center mx-4"><div className="flex justify-between text-[10px] text-stone-400 font-mono mb-1"><span>XP</span><span>{Math.floor(activeSave.xp)} / {xpReq}</span></div><div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800 relative group"><div className="h-full bg-cyan-600 transition-all duration-500" style={{width: `${xpPercent}%`}}></div><div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div></div></div>
                     <button onClick={() => setShowStats(!showStats)} className="md:hidden bg-stone-800 text-stone-300 p-2 rounded-xl border border-stone-600"><BarChart2 size={18}/></button>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto justify-center flex-wrap">
                     <div className="bg-black/40 px-3 py-2 rounded-lg border border-yellow-900/30 text-yellow-500 font-mono font-bold flex items-center gap-1"><Coins size={14}/> {activeSave.gold}</div>
                     {activeSave.level >= 15 && !isForge && <button onClick={() => setScreen('forge')} className="bg-orange-900/50 text-orange-200 px-3 py-2 rounded-xl font-bold border border-orange-700"><Hammer size={18}/></button>}
                     {isForge && <button onClick={() => setScreen('hub')} className="bg-stone-700 text-white px-3 py-2 rounded-xl font-bold">Exit</button>}
                     <button onClick={() => setScreen('heirlooms')} className="bg-purple-900/50 text-purple-200 px-3 py-2 rounded-xl font-bold border border-purple-700"><Anvil size={18}/></button>
                     <button onClick={() => setScreen('talents')} className="bg-stone-800 text-stone-300 px-3 py-2 rounded-xl font-bold border border-stone-600 flex items-center gap-1"><BookOpen size={18}/> {activeSave.talentPoints > 0 && <span className="bg-red-600 text-white text-[10px] px-1 rounded-full">{activeSave.talentPoints}</span>}</button>
                     
                     <button onClick={() => setShowPotionInv(true)} className={`px-3 py-2 rounded-xl font-bold border flex items-center gap-1 transition-all ${activePotionCount > 0 ? 'bg-indigo-900/50 border-indigo-500 text-indigo-300 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-stone-800 text-stone-400 border-stone-600'}`}>
                        <FlaskConical size={18}/> 
                        {activePotionCount > 0 && <span className="bg-indigo-500 text-white text-[10px] px-1.5 rounded-full animate-pulse">{activePotionCount}</span>}
                     </button>

                     {/* DROPDOWN WAYPOINT SELECTOR */}
                     <div className="relative">
                        <select 
                            value={runLevel} 
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                setRunLevel(val);
                                setStartFloor(val); 
                            }}
                            className="bg-stone-800 text-amber-500 font-bold p-3 pr-8 rounded-xl border border-stone-600 appearance-none outline-none cursor-pointer hover:bg-stone-700 transition-colors h-full"
                        >
                            {getAvailableCheckpoints().map(f => (
                                <option key={f} value={f}>Floor {f} {f > 1 ? '(Checkpoint)' : ''}</option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none">
                            <MapIcon size={16}/>
                        </div>
                     </div>

                     <button onClick={startCombat} className="bg-red-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 flex-1 md:flex-none justify-center"><Skull size={20} /> NEXT</button>
                  </div>
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto p-2 md:p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-5 bg-[#e3d5ca] text-stone-800 rounded-2xl p-4 shadow-2xl relative border-4 border-[#a1887f]">
                <h3 className="text-center font-black text-[#5d4037] uppercase tracking-widest mb-4 border-b-2 border-[#8d6e63] pb-2">Gear</h3>
                <div className="grid grid-cols-5 gap-2">{[ITEM_SLOTS.HEAD, ITEM_SLOTS.BODY, ITEM_SLOTS.GLOVES, ITEM_SLOTS.BOOTS, ITEM_SLOTS.AMULET, ITEM_SLOTS.BELT, ITEM_SLOTS.WEAPON, ITEM_SLOTS.OFFHAND, ITEM_SLOTS.RING1, ITEM_SLOTS.RING2].map(slot => (<div key={slot} className="aspect-square bg-[#5d4037]/10 border border-[#8d6e63]/40 rounded-xl flex items-center justify-center relative">{activeSave.equipment[slot] ? <ItemCard item={activeSave.equipment[slot]} onClick={(i) => setSelectedItem({item: i, context: 'equipment', slot})} isSelected={selectedItem?.item?.id === activeSave.equipment[slot].id} /> : <div className="text-[8px] uppercase font-bold text-[#8d6e63]/40">{slot.replace(/\d/, '')}</div>}</div>))}</div>
                
                {/* EMBEDDED STATS PANEL */}
                <div className="mt-4 pt-4 border-t-2 border-[#8d6e63]/30">
                    <h3 className="text-center font-bold text-[#5d4037] uppercase tracking-widest mb-2 text-xs">Combat Stats</h3>
                    <div className="bg-[#5d4037]/5 rounded-xl p-2 h-48 overflow-y-auto custom-scrollbar">
                        {Object.values(COMBO_TYPES).map(type => {
                            const result = getBaseScoreForType(type.id, activeSave.equipment, heroClass.bonuses, activeSave.talentRanks, activeClassId, activeSave.paragonRanks, {hearts, maxHearts, rollsLeft, gold: activeSave.gold});
                            return (
                                <div key={type.id} className="flex justify-between items-center py-1 border-b border-[#8d6e63]/10 last:border-0">
                                    <span className="font-bold text-[#5d4037] text-xs">{type.name}</span>
                                    <div className="text-right leading-none">
                                        <div className="font-black text-[#8d6e63]">{result.totalDmg}</div>
                                        <div className="text-[8px] text-[#8d6e63]/70 font-mono">
                                            {Math.floor(result.breakdown.base)} + {Math.floor(result.breakdown.flat)} x {Math.floor(100 + result.breakdown.mult)}%
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
            <div className="lg:col-span-7 bg-stone-900 rounded-2xl p-4 border border-stone-800 shadow-xl min-h-[300px]">
                <div className="flex justify-between items-center mb-4"><h3 className="text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2"><Backpack size={16}/> Bag</h3><div className="text-stone-400 font-mono text-xs flex items-center gap-1"><Anvil size={12}/> {activeSave.scraps}</div></div>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-2">{activeSave.inventory.map((item, i) => (<div key={item.id} className="aspect-square bg-stone-950 border border-stone-800 rounded-xl flex items-center justify-center"><ItemCard item={item} onClick={(i) => setSelectedItem({item: i, context: 'inventory', index: i})} isSelected={selectedItem?.item?.id === item.id} /></div>))}</div>
            </div>
          </div>
          {selectedItem && (<ComparisonView selected={selectedItem.item} equipped={selectedItem.context === 'inventory' && selectedItem.item.type !== 'gem' && selectedItem.item.type !== 'scroll' && !selectedItem.item.type.startsWith('pot_') ? getComparisonItem(selectedItem.item) : null} onClose={() => setSelectedItem(null)} onAction={selectedItem.context === 'inventory' ? (isForge ? handleUpgrade : handleEquip) : handleUnequip} actionLabel={selectedItem.context === 'inventory' ? (isForge ? 'Upgrade' : 'Equip') : 'Unequip'} isUpgrade={isForge} cost={isForge ? `${(10 + selectedItem.item.upgradeLevel * 5)}sc` : null} secondAction={selectedItem.context === 'inventory' && (selectedItem.item.type === 'gem' || selectedItem.item.type === 'scroll') ? () => { const target = activeSave.equipment.weapon; if(target) handleApplyConsumable(selectedItem.item, target); } : null} secondActionLabel="Apply to Weapon" onSell={!isForge && selectedItem.context === 'inventory' ? handleSell : null} onSwitchSlot={() => setCompareRingSlot(prev => prev === 'ring1' ? 'ring2' : 'ring1')} currentSlot={compareRingSlot} />)}
          {/* StatsDrawer removed */}
          {showPotionInv && <PotionInventory potions={activeSave.potions || {}} onClose={() => setShowPotionInv(false)} onDrink={handleDrinkPotion} />}
        </div>
      );
  }

  // ... (Talent and Heirloom screens remain same, omitted for brevity as no logic changes there, they render fine)
  // Re-including essential renders for full file validity
  
  if (screen === 'talents') {
     if (!activeClassId) { setScreen('select'); return null; }
     const specs = Object.values(TALENT_TREES[activeClassId]);
     const getTreePointsPending = (specKey) => { if (!pendingRanks) return 0; const tree = TALENT_TREES[activeClassId][specKey]; return tree.talents.reduce((sum, t) => sum + (pendingRanks[t.id] || 0), 0); };
     const savedSum = Object.values(activeSave.talentRanks).reduce((a, b) => a + b, 0); const totalPoints = activeSave.talentPoints + savedSum; const pendingSum = pendingRanks ? Object.values(pendingRanks).reduce((a, b) => a + b, 0) : 0; const pendingUnspent = totalPoints - pendingSum; const currentSpecKey = Object.keys(TALENT_TREES[activeClassId])[talentTab];
     return (<div className="min-h-screen bg-stone-950 text-stone-100 p-4 flex flex-col items-center overflow-y-auto"><div className="max-w-4xl w-full pb-20"><div className="flex justify-between items-center mb-6"><button onClick={() => setScreen('hub')} className="flex items-center gap-2 text-stone-400 hover:text-white"><ArrowLeft /> Hub</button><div className="text-right"><h2 className="text-2xl font-bold text-amber-500">{heroClass.name}</h2><div className="text-stone-400 flex gap-2"><span>Points: <span className={`${pendingUnspent > 0 ? 'text-green-400' : 'text-white'} font-bold`}>{pendingUnspent}</span></span> {activeSave.level >= 60 && <span className="text-cyan-400">PP: {activeSave.paragonPoints}</span>}</div></div></div><div className="flex gap-2 mb-6 overflow-x-auto">{Object.keys(TALENT_TREES[activeClassId]).map((key, idx) => (<button key={key} onClick={() => { setTalentTab(idx); setSelectedTalent(null); }} className={`px-4 py-2 rounded-lg font-bold flex-1 border ${talentTab === idx ? 'bg-stone-800 border-amber-600 text-white' : 'bg-stone-900 border-stone-800 text-stone-500'}`}>{TALENT_TREES[activeClassId][key].name} <span className="ml-2 text-xs bg-black px-2 rounded">{getTreePointsPending(key)}</span></button>))} {activeSave.level >= 60 && (<button onClick={() => setTalentTab(3)} className={`px-4 py-2 rounded-lg font-bold flex-1 border ${talentTab === 3 ? 'bg-cyan-900 border-cyan-500 text-white' : 'bg-stone-900 border-stone-800 text-cyan-700'}`}>Paragon</button>)}</div>{talentTab < 3 ? (<div className="relative p-4 bg-[#1c1917] rounded-xl border-4 border-stone-800 shadow-inner min-h-[700px] w-full overflow-x-auto"><div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#333_1px,_transparent_1px)] [background-size:20px_20px]"></div><div className="relative min-w-[300px] mx-auto grid grid-cols-4 grid-rows-9 gap-y-8 gap-x-4 place-items-center pb-24"><svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"><defs><marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#444" /></marker><marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#fbbf24" /></marker></defs>{specs[talentTab].talents.map(t => { if (!t.prereq) return null; const parent = specs[talentTab].talents.find(p => p.id === t.prereq); if (!parent) return null; const x1 = (parent.col - 1) * 25 + 12.5; const y1 = (parent.row - 1) * 11.1 + 5.5; const x2 = (t.col - 1) * 25 + 12.5; const y2 = (t.row - 1) * 11.1 + 1; const isUnlocked = pendingRanks && (pendingRanks[parent.id] || 0) === parent.max; return <line key={`link-${parent.id}-${t.id}`} x1={`${x1}%`} y1={`${y1 + 5}%`} x2={`${x2}%`} y2={`${y2}%`} stroke={isUnlocked ? "#fbbf24" : "#333"} strokeWidth="2" markerEnd={isUnlocked ? "url(#arrowhead-active)" : "url(#arrowhead)"} />; })}</svg>{specs[talentTab].talents.map(t => { const currentRank = pendingRanks ? (pendingRanks[t.id] || 0) : 0; const treePoints = getTreePointsPending(currentSpecKey); const parentMaxed = !t.prereq || ((pendingRanks && pendingRanks[t.prereq] || 0) === specs[talentTab].talents.find(p => p.id === t.prereq).max); const tierUnlocked = treePoints >= t.req; const isAvailable = tierUnlocked && parentMaxed; const isMaxed = currentRank === t.max; const isSelected = selectedTalent && selectedTalent.id === t.id; return (<div key={t.id} className="relative group z-10" style={{ gridColumn: t.col, gridRow: t.row }}><button onClick={() => setSelectedTalent(t)} className={`w-12 h-12 rounded border-2 flex items-center justify-center transition-all shadow-lg ${isMaxed ? 'bg-amber-900/80 border-amber-400 text-amber-200' : (isAvailable ? (currentRank > 0 ? 'bg-stone-800 border-green-500 text-white' : 'bg-stone-800 border-stone-500 text-stone-400 hover:border-stone-300') : 'bg-stone-900 border-stone-800 text-stone-700 grayscale cursor-not-allowed')} ${isSelected ? 'ring-4 ring-white scale-110 z-20' : ''}`}>{specs[talentTab].icon}</button><div className={`absolute -bottom-2 -right-2 text-[10px] px-1.5 rounded border bg-black font-bold font-mono pointer-events-none ${isMaxed ? 'text-amber-400 border-amber-400' : (currentRank > 0 ? 'text-green-400 border-green-500' : 'text-stone-600 border-stone-700')}`}>{currentRank}/{t.max}</div></div>) })}</div>{selectedTalent && (<div className="fixed inset-x-0 bottom-0 md:bottom-10 md:left-1/2 md:-translate-x-1/2 md:w-[500px] p-4 z-[100] animate-in slide-in-from-bottom-10"><div className="bg-[#0c0a09] border-2 border-[#78350f] rounded-xl p-4 shadow-2xl relative"><button onClick={() => setSelectedTalent(null)} className="absolute top-2 right-2 text-stone-500 hover:text-white"><X size={20}/></button><div className="flex items-start gap-4"><div className="p-3 bg-stone-800 border border-stone-600 rounded-lg">{specs[talentTab].icon}</div><div className="flex-1"><h4 className="text-amber-500 font-bold text-lg">{selectedTalent.name}</h4><p className="text-stone-300 text-sm mb-2">{selectedTalent.desc}</p><div className="text-xs font-mono text-stone-500 mb-2">Rank {pendingRanks[selectedTalent.id] || 0} / {selectedTalent.max}{selectedTalent.req > 0 && <span className="ml-2 text-red-400">(Req {selectedTalent.req} pts)</span>}</div><div className="flex items-center gap-4 mt-4"><button onClick={() => handleTalentChange(selectedTalent, -1, currentSpecKey)} disabled={(pendingRanks[selectedTalent.id] || 0) <= 0} className="w-10 h-10 rounded bg-stone-800 border border-stone-600 flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-red-400"><Minus size={20}/></button><div className="text-xl font-bold text-white w-8 text-center">{pendingRanks[selectedTalent.id] || 0}</div><button onClick={() => handleTalentChange(selectedTalent, 1, currentSpecKey)} disabled={(pendingRanks[selectedTalent.id] || 0) >= selectedTalent.max || pendingUnspent <= 0} className="w-10 h-10 rounded bg-stone-800 border border-stone-600 flex items-center justify-center hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-green-400"><Plus size={20}/></button></div></div></div></div></div>)}{JSON.stringify(pendingRanks) !== JSON.stringify(activeSave.talentRanks) && (<div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[90]"><button onClick={applyTalents} className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold shadow-xl flex items-center gap-2 animate-bounce"><Check size={20}/> Apply Changes</button></div>)}</div>) : (<div className="grid grid-cols-1 gap-4">{PARAGON_TALENTS.map(pt => { const currentRank = activeSave.paragonRanks[pt.id] || 0; const canAfford = activeSave.paragonPoints > 0; return (<div key={pt.id} className="bg-stone-900 border border-cyan-900 p-4 rounded-xl flex items-center gap-4"><div className="bg-cyan-900/20 p-3 rounded-full text-cyan-400">{pt.icon}</div><div className="flex-1"><h4 className="font-bold text-cyan-200">{pt.name} <span className="text-stone-500 text-xs ml-2">Lvl {currentRank}</span></h4><p className="text-xs text-stone-400">{pt.desc}</p></div><button onClick={() => { if(canAfford) { updateActiveSave({ paragonRanks: { ...activeSave.paragonRanks, [pt.id]: currentRank + 1 }, paragonPoints: activeSave.paragonPoints - 1 }); }}} disabled={!canAfford} className={`px-6 py-2 rounded-lg font-bold ${canAfford ? 'bg-cyan-600 text-white' : 'bg-stone-800 text-stone-600'}`}>Upgrade</button></div>) })}</div>)}</div></div>); }
  if (screen === 'heirlooms') { const available = getAvailableGems(activeClassId); const ownedIds = heirloomInventory.map(i => i.name); const rerollCost = 1 + Math.floor((activeSave ? activeSave.level : 1) / 10); return (<div className="min-h-screen bg-stone-950 text-stone-200 p-8 flex flex-col items-center"><div className="max-w-4xl w-full"><div className="flex justify-between items-center mb-8"><button onClick={() => setScreen(activeClassId ? 'hub' : 'select')} className="flex items-center gap-2 text-stone-400 hover:text-white"><ArrowLeft /> Back</button><div className="flex items-center gap-4"><h2 className="text-2xl font-bold text-purple-400">Heirloom Forge</h2><div className="bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-500/30 flex items-center gap-2"><Ghost size={16} className="text-purple-400"/> <span className="font-bold text-white">{available}</span> {accountBoundUnlocked && '(Shared)'}</div></div></div><HeirloomShop level={activeSave ? activeSave.level : 1} activeClassId={activeClassId || 'warrior'} soulGems={available} buyHeirloom={buyHeirloom} ownedIds={ownedIds} shopStock={shopStock} lockedId={lockedShopItemId} lockItem={toggleShopLock} refreshShop={() => refreshHeirloomShop(true)} rerollCost={rerollCost} onSelect={(item) => handleShopClick(item, 'heirloom')} />{selectedItem && (<ComparisonView selected={selectedItem.item} equipped={activeSave && activeSave.equipment ? (selectedItem.item.type.includes('ring') ? activeSave.equipment[compareRingSlot] : activeSave.equipment[selectedItem.item.type]) : null} onClose={() => setSelectedItem(null)} onAction={confirmBuy} actionLabel="Unlock" cost={`${selectedItem.item.cost} Gems`} onSwitchSlot={() => setCompareRingSlot(prev => prev === 'ring1' ? 'ring2' : 'ring1')} currentSlot={compareRingSlot} />)}</div></div>); }
  if (screen === 'vendor') { return (<div className="min-h-screen bg-stone-950 text-stone-200 p-4 flex flex-col items-center"><div className="max-w-5xl w-full bg-stone-900 rounded-2xl p-8 border border-stone-800 shadow-2xl relative pb-24"><div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-stone-800 pb-6"><div className="flex items-center gap-4"><div className="bg-amber-700/20 p-3 rounded-full text-amber-500"><ShoppingBag size={32} /></div><div><h2 className="text-3xl font-bold text-amber-500">Merchant</h2><p className="text-stone-500">"Spend your coin!"</p></div></div></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div><div className="grid grid-cols-3 gap-4">{vendorItems.map((item, i) => (<div key={item.id} className="relative group cursor-pointer" onClick={() => handleShopClick(item, 'vendor')}><div className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all hover:-translate-y-1 ${RARITY_COLORS[item.rarity]} ${activeSave.gold < item.value ? 'opacity-50 grayscale' : ''}`}><ItemCard item={item} onClick={()=>{}} equipped={null} /><div className="bg-black/40 px-2 rounded text-xs font-bold text-yellow-300">{item.value}g</div></div></div>))}</div></div><div className="border-l border-stone-800 pl-8"><h3 className="text-stone-400 font-bold uppercase tracking-widest mb-4">Your Bag</h3><div className="grid grid-cols-4 gap-3">{activeSave.inventory.map((item, i) => (<div key={item.id} className="relative group"><ItemCard item={item} onClick={() => setSelectedItem({item, context: 'inventory', index: i})} equipped={null} sellMode={true} price={`${Math.floor(item.value * 0.5)}g`}/></div>))}</div></div></div><div className="absolute bottom-0 left-0 right-0 bg-stone-900 p-4 border-t border-stone-800 flex justify-between items-center z-20"><div className="text-yellow-400 font-mono font-bold text-2xl flex items-center gap-2 bg-stone-950 px-4 py-2 rounded-lg"><Coins /> {activeSave.gold}g</div><button onClick={() => { setRunLevel(l => l+1); setScreen('hub'); }} className="bg-green-700 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2">Leave <ChevronRight /></button></div>{selectedItem && (<ComparisonView selected={selectedItem.item} equipped={activeSave.equipment[selectedItem.item.type.includes('ring') ? compareRingSlot : selectedItem.item.type]} onClose={() => setSelectedItem(null)} onAction={selectedItem.context === 'inventory' ? handleSell : confirmBuy} actionLabel={selectedItem.context === 'inventory' ? "Sell" : "Buy"} cost={selectedItem.context === 'inventory' ? `+${Math.floor(selectedItem.item.value * 0.5)}g` : `${selectedItem.item.value}g`} onSwitchSlot={() => setCompareRingSlot(prev => prev === 'ring1' ? 'ring2' : 'ring1')} currentSlot={compareRingSlot} />)}</div></div>); }
  if (screen === 'combat') { if(!enemy) return null; return (<div className={`min-h-screen bg-stone-900 text-stone-100 flex flex-col overflow-hidden ${enemy.isBoss ? 'shadow-[inset_0_0_100px_rgba(220,38,38,0.2)]' : ''}`}><div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 to-stone-950"><div className="absolute top-6 left-6 flex gap-2">{[...Array(maxHearts)].map((_, i) => (<Heart key={i} size={32} fill={i < hearts ? "#ef4444" : "none"} className={i < hearts ? "text-red-500" : "text-stone-700"}/>))}</div><div className="absolute top-20 left-6 z-20 flex flex-col gap-2">{toasts.map(t => (<div key={t.id} className="bg-black/70 text-amber-400 px-4 py-2 rounded-lg animate-in slide-in-from-left-10 fade-in duration-300 font-bold text-sm border-l-4 border-amber-500 shadow-xl">{t.msg}</div>))}</div><div className="relative z-10"><div className={`text-8xl mb-6 animate-pulse drop-shadow-2xl ${enemy.isBoss ? 'scale-125' : 'grayscale-[0.2]'}`}>{enemy.img}</div>{dmgPopup && <div className="absolute top-0 right-[-50px] text-6xl font-black text-red-500 animate-bounce drop-shadow-[0_4px_0_rgba(0,0,0,1)] z-50">-{dmgPopup}</div>}</div><h2 className={`text-3xl font-black mb-4 tracking-tight ${enemy.isBoss ? 'text-red-500' : ''}`}>{enemy.name}</h2><div className={`w-full max-w-lg h-8 bg-stone-950 rounded-full border-2 ${enemy.isBoss ? 'border-red-900' : 'border-stone-800'} overflow-hidden relative shadow-2xl`}><div className={`h-full transition-all duration-500 ease-out ${enemy.isBoss ? 'bg-red-600' : 'bg-amber-600'}`} style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /><div className="absolute inset-0 flex items-center justify-center text-sm font-bold shadow-sm uppercase tracking-wider text-white mix-blend-difference">{enemy.hp} / {enemy.maxHp} HP</div></div></div><div className="bg-[#e6dcd3] text-stone-800 p-8 pt-12 shadow-[0_-20px_60px_rgba(0,0,0,0.7)] z-10 rounded-t-[3rem] relative"><div className="flex justify-center gap-3 md:gap-6 mb-10">{dice.map((val, idx) => <Die key={idx} value={val} locked={locked[idx]} rolling={rolling} onClick={() => toggleLock(idx)} />)}</div><div className="flex justify-between items-end max-w-2xl mx-auto bg-white/50 p-6 rounded-2xl border border-stone-300/50 backdrop-blur-sm">{hasRolled ? (<><div><div className="text-xs font-bold uppercase text-stone-500 mb-1 tracking-wider">Combo Detected</div><div className="text-2xl font-black text-stone-800 leading-none">{currentScore.combo.name}</div><div className="text-[10px] text-stone-500 mt-2 font-mono flex gap-2"><span className="bg-stone-200 px-1 rounded">Base: {currentScore.breakdown.base}</span><span className="bg-blue-100 text-blue-800 px-1 rounded">Flat: +{Math.floor(currentScore.breakdown.flat)}</span><span className="bg-purple-100 text-purple-800 px-1 rounded">Mult: +{Math.floor(currentScore.breakdown.mult)}%</span></div></div><div className="text-right"><div className="flex items-center gap-2 justify-end text-red-600"><Flame size={24} fill="currentColor" /><div className="text-5xl font-black tracking-tighter">{currentScore.totalDmg}</div></div><div className="text-xs font-bold uppercase text-red-400 tracking-widest mt-1">Total Damage</div></div></>) : (<div className="w-full text-center text-stone-500 italic font-bold">Roll the dice to start the round!</div>)}</div></div><div className="bg-stone-900 p-6 pb-10 flex items-center justify-center gap-4 border-t border-stone-800"><button onClick={() => rollAllDice(!hasRolled)} disabled={hasRolled && (rollsLeft === 0 || rolling)} className={`flex-1 max-w-[240px] h-16 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${hasRolled && rollsLeft > 0 ? 'bg-amber-600 hover:bg-amber-500 hover:-translate-y-1 text-white shadow-[0_4px_0_#92400e]' : (!hasRolled ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_4px_0_#166534]' : 'bg-stone-800 text-stone-600 cursor-not-allowed')}`}><RefreshCw className={rolling ? 'animate-spin' : ''}/> {!hasRolled ? 'Start Round' : (rollsLeft > 0 ? `Roll (${rollsLeft})` : 'No Rolls Left')}</button><button onClick={attack} disabled={rolling || !hasRolled} className={`flex-1 max-w-[240px] h-16 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 transition-all ${hasRolled ? 'bg-red-600 hover:bg-red-500 hover:-translate-y-1 text-white shadow-[0_4px_0_#991b1b]' : 'bg-stone-800 text-stone-600 cursor-not-allowed'}`}><Sword size={24} /> Attack!</button></div></div>); }
  if (screen === 'result_win') { return (<div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500"><Trophy size={80} className="text-yellow-500 mb-6 animate-bounce" /><h2 className="text-5xl text-white font-black mb-2">VICTORY!</h2><button onClick={() => { setRunLevel(l => l + 1); setScreen('hub'); }} className="bg-amber-600 text-white px-10 py-4 rounded-2xl font-bold text-xl hover:bg-amber-500 hover:scale-105 transition-all shadow-lg shadow-amber-900/50">Continue</button></div>); }
  if (screen === 'result_loss') { 
    return (
        <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
            <Skull size={80} className="text-red-600 mb-6" />
            <h2 className="text-5xl text-white font-black mb-2">RUN ENDED</h2>
            <div className="text-green-400 font-mono text-lg mb-8">+ {lastRunXp} XP Gained</div>
            
            {lootBoxRewards === null && (
               <div className="mb-8 text-stone-500 italic">No loot cache earned. (You must clear at least 1 floor!)</div>
            )}

            {!isLootBoxOpen && lootBoxRewards && (
                <div className="mb-8 p-6 bg-stone-800 rounded-2xl border-2 border-amber-600/50 flex flex-col items-center gap-4 hover:scale-105 transition-transform cursor-pointer shadow-[0_0_30px_rgba(245,158,11,0.2)]" onClick={() => {
                    setIsLootBoxOpen(true); 
                    // Only update UI state here, actual data is saved in resetRun
                }}>
                    <Gift size={64} className="text-amber-500 animate-bounce" />
                    <div>
                        <h3 className="text-2xl font-bold text-amber-500">Survivor's Cache</h3>
                        <p className="text-stone-400 text-sm">Contains {lootBoxRewards.length} items</p>
                    </div>
                    <div className="text-xs text-stone-500 uppercase tracking-widest mt-2 animate-pulse">Click to Open</div>
                </div>
            )}

            {isLootBoxOpen && lootBoxRewards && (
                <div className="mb-8 w-full max-w-2xl animate-in zoom-in-50 duration-300">
                    <h3 className="text-amber-500 font-bold mb-4 flex items-center justify-center gap-2"><PackageOpen/> Cache Contents Added to Heirlooms</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {lootBoxRewards.map((item, idx) => (
                             <div key={idx} className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-5 fade-in duration-500" style={{animationDelay: `${idx * 100}ms`}}>
                                <ItemCard item={item} onClick={() => {}} equipped={null} />
                                <span className={`text-xs font-bold ${item.type.startsWith('pot_') ? item.color : RARITY_COLORS[item.rarity].split(' ')[2]}`}>{item.name}</span>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-4">
                <button onClick={resetRun} className="bg-stone-700 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-stone-600 border-b-4 border-stone-900">Return to Menu</button>
            </div>
        </div>
    ); 
  }

  return null;
}