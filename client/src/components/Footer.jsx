
import React from "react";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Mail,
    ArrowUpRight,
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-[#171614] text-[#f8f6f2]">
            {/* Newsletter / brand section */}
            <div className="mx-auto max-w-7xl px-6 py-14 sm:px-10 lg:px-12">
                <div className="grid gap-10 border-b border-white/15 pb-12 md:grid-cols-2 md:items-center">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <ShoppingBag size={25} strokeWidth={1.5} />
                            <span className="text-2xl font-semibold tracking-[0.15em]">
                                TrendKart
                            </span>
                        </div>

                        <p className="max-w-md text-sm leading-7 text-white/60">
                            Thoughtfully selected essentials for your everyday style.
                            Discover quality, simplicity, and timeless design.
                        </p>
                    </div>

                    <div className="md:justify-self-end">
                        <p className="mb-3 text-xs uppercase tracking-[0.22em] text-[#c5b39a]">
                            The TrendKart experience
                        </p>

                        <p className="text-lg font-medium">
                            Find something you’ll love.
                        </p>

                        <Link
                            to="/"
                            className="mt-4 inline-flex items-center gap-2 border-b border-[#c5b39a] pb-2 text-sm transition hover:text-[#c5b39a]"
                        >
                            Explore the collection
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                </div>

                {/* Footer links */}
                <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-3">
                    <div>
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c5b39a]">
                            Discover
                        </h3>

                        <ul className="space-y-3 text-sm text-white/65">
                            <li>
                                <Link to="/" className="transition hover:text-white">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link to="/cart" className="transition hover:text-white">
                                    Shopping Cart
                                </Link>
                            </li>
                            <li>
                                <Link to="/wishlist" className="transition hover:text-white">
                                    Wishlist
                                </Link>
                            </li>
                            <li>
                                <Link to="/orders" className="transition hover:text-white">
                                    My Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c5b39a]">
                            Customer Care
                        </h3>

                        <ul className="space-y-3 text-sm text-white/65">
                            <li>
                                <Link to="/orders" className="transition hover:text-white">
                                    Order Tracking
                                </Link>
                            </li>
                            <li>
                                <a href="mailto:support@trendkart.com" className="transition hover:text-white">
                                    Contact Support
                                </a>
                            </li>
                            <li>
                                <a href="mailto:support@trendkart.com" className="transition hover:text-white">
                                    Returns & Help
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                        <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#c5b39a]">
                            Stay Connected
                        </h3>

                        <p className="mb-4 text-sm leading-6 text-white/60">
                            Questions about your order? Send our team an email.
                        </p>

                        <a
                            href="mailto:trendkart.shoppingsite@gmail.com"
                            className="inline-flex items-center gap-2 text-sm transition hover:text-[#c5b39a]"
                        >
                            <Mail size={16} />
                            Email us
                        </a>
                    </div>
                </div>

                {/* Copyright */}
                <div className="flex flex-col gap-3 border-t border-white/15 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} TrendKart. All rights reserved.</p>
                    <p>Designed for your everyday style.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;