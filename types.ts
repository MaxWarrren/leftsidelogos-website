import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface OrderItem {
  id: string;
  type: string;
  size: string;
  quantity: number;
  color: string;
  unitPrice: number;
}