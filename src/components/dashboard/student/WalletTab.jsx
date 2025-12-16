"use client";

import { useState } from "react";
import { Coins, TrendingUp, Award, ShoppingBag, Gift } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { motion } from "framer-motion";

export default function WalletTab() {
  const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const walletData = {
    balance: 450,
    totalEarned: 650,
    totalSpent: 200,
  };

  const transactions = [
    {
      id: 1,
      type: "earn",
      amount: 50,
      source: "Hackathon Participation",
      date: "2025-12-15",
      icon: "🏆",
    },
    {
      id: 2,
      type: "earn",
      amount: 30,
      source: "Club Event Volunteer",
      date: "2025-12-14",
      icon: "🙌",
    },
    {
      id: 3,
      type: "spend",
      amount: 100,
      source: "Campus Merch - T-Shirt",
      date: "2025-12-13",
      icon: "👕",
    },
    {
      id: 4,
      type: "earn",
      amount: 25,
      source: "Workshop Attendance",
      date: "2025-12-12",
      icon: "📚",
    },
    {
      id: 5,
      type: "spend",
      amount: 50,
      source: "Food Coupon",
      date: "2025-12-10",
      icon: "🍕",
    },
    {
      id: 6,
      type: "earn",
      amount: 40,
      source: "Sports Event Winner",
      date: "2025-12-09",
      icon: "⚽",
    },
  ];

  const marketplaceItems = [
    {
      id: 1,
      name: "Campus Hoodie",
      price: 200,
      image: "👕",
      category: "Apparel",
      inStock: true,
      description: "Premium quality campus hoodie",
    },
    {
      id: 2,
      name: "Coffee Voucher",
      price: 30,
      image: "☕",
      category: "Food",
      inStock: true,
      description: "Free coffee at campus cafe",
    },
    {
      id: 3,
      name: "Tech Gadget Bundle",
      price: 500,
      image: "🎧",
      category: "Electronics",
      inStock: true,
      description: "Wireless earbuds and accessories",
    },
    {
      id: 4,
      name: "Library Pass",
      price: 50,
      image: "📚",
      category: "Services",
      inStock: true,
      description: "24/7 library access for 1 month",
    },
    {
      id: 5,
      name: "Pizza Party Coupon",
      price: 150,
      image: "🍕",
      category: "Food",
      inStock: true,
      description: "Free pizza party for your group",
    },
    {
      id: 6,
      name: "Campus Backpack",
      price: 180,
      image: "🎒",
      category: "Apparel",
      inStock: false,
      description: "Branded campus backpack - Out of stock",
    },
  ];

  const handleRedeem = (item) => {
    setSelectedItem(item);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Wallet
        </h1>
        <Button onClick={() => setIsMarketplaceOpen(true)}>
          <ShoppingBag className="w-5 h-5 mr-2" />
          Marketplace
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-4">
            <Coins className="w-8 h-8" />
            <TrendingUp className="w-6 h-6 opacity-70" />
          </div>
          <p className="text-sm opacity-90 mb-2">Current Balance</p>
          <p className="text-4xl font-bold">{walletData.balance}</p>
          <p className="text-sm opacity-70 mt-2">coins</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Earned
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {walletData.totalEarned}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">
            +{walletData.totalEarned} all time
          </p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <ShoppingBag className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Spent
          </p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white">
            {walletData.totalSpent}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
            -{walletData.totalSpent} all time
          </p>
        </Card>
      </div>

      {/* Transaction History */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Transaction History
        </h2>
        <Card>
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  transaction.type === "earn"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{transaction.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.source}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.date}
                    </p>
                  </div>
                </div>
                <div
                  className={`text-xl font-bold ${
                    transaction.type === "earn"
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {transaction.type === "earn" ? "+" : "-"}
                  {transaction.amount}
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Marketplace Modal */}
      <Modal
        isOpen={isMarketplaceOpen}
        onClose={() => setIsMarketplaceOpen(false)}
        title="Marketplace"
        size="xl"
      >
        <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">
              Your Balance:
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {walletData.balance} coins
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplaceItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className={!item.inStock ? "opacity-60" : ""}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{item.image}</div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Coins className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.price}
                    </span>
                  </div>
                  <Button
                    variant={item.inStock ? "primary" : "secondary"}
                    className="w-full"
                    disabled={!item.inStock || walletData.balance < item.price}
                    onClick={() => handleRedeem(item)}
                  >
                    {!item.inStock
                      ? "Out of Stock"
                      : walletData.balance < item.price
                        ? "Insufficient Coins"
                        : "Redeem"}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </Modal>

      {/* Redeem Confirmation Modal */}
      <Modal
        isOpen={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title="Confirm Redemption"
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-8xl mb-4">{selectedItem.image}</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedItem.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedItem.description}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">
                  Item Price:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedItem.price} coins
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700 dark:text-gray-300">
                  Your Balance:
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {walletData.balance} coins
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                <span className="font-bold text-gray-900 dark:text-white">
                  After Purchase:
                </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {walletData.balance - selectedItem.price} coins
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedItem(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  // Handle redemption logic here
                  alert("Item redeemed successfully!");
                  setSelectedItem(null);
                  setIsMarketplaceOpen(false);
                }}
              >
                <Gift className="w-5 h-5 mr-2" />
                Confirm Redeem
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
