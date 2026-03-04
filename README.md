Problem Statement 2 - E-Commerce Order & Inventory Management System

1. Hackathon Objective

This hackathon evaluates:

Java OOP & layered architecture

Spring Boot REST API design

SQL relationships & joins

Transaction handling

Businexs rule validation

Data consistency (stock management)

dential

2. Problem Statement

Design and develop a Backend E-Commerce Order Management System.

The system should allow:

Customers to browse products

Customers to place orders

System to validate and reduce stock

Admin to manage products

Track complete order lifecycle

The system must ensure stock consistency and proper workflow transitions

3. Core Domain Entities

3.1 User

id

name

role

Roles:

ADMIN

CUSTOMER

3.2 Product

id

name

description

price

available Quantity

status ( ACTIVE/INACTIVE)

createdAt

3.3 Order

Id

customer (User)

totalAmount

Status

createdAt

updatedAt

Status Lifecycle (Mandatory)

CREATED CONFIRMED SHIPPED

DELIVERED

→

CANCELLED

Rules:

Cannot skip stages

Once SHIPPED → cannot cancel

Once DELIVERED → no further changes

3.4 OrderItem

id

order

product

⚫ quantity

priceAt Purchase

(Many products per order)

fidenti

REQUIREMENTS 4. MUST HAVE REQUIREMENTS

4.1 User Management

Create user

Fetch users

Only ADMIN can view all users

4.2 Product Management

ADMIN can:

Create product

Update product

Activate / Deactivate product

View all products

CUSTOMER can:

View ACTIVE products only

4.3 Order Management

CUSTOMER can:

Create order (with multiple products)

View own orders

Cancel order (only if status = CREATED)

ADMIN can:

Confirm order

Mark as shipped

Mark as delivered

5. Business Rules (Strictly Enforced)

Only ACTIVE products can be ordered

Ordered quantity must be ≤ available Quantity

When order is CONFIRMED:

Reduce product stock

If order is CANCELLED before confirmation:

Do not reduce stock

If SHIPPED:

Cannot cancel

totalAmount must be auto-calculated

priceAtPurchase must be stored (even if product price changes later)

Order must contain at least one product

6. REST API Requirements

Proper HTTP methods

Clear request & response DTOS

Meaningful status codes

Validation annotations

Structured error responses


POST/api/products

GET /api/products

POST/api/orders

PUT/api/orders/{id}/confirm

PUT/api/orders/{id}/ship

PUT/api/orders/{id}/cancel

7. Database Requirements

Minimum Tables:

users

products

orders

order items

Mandatory:

Proper foreign key relationships

One-to-many (Order

OrderItems)

Many-to-one

Enum mapping for status and role

At least one JOIN query:

Fetch order with items

Total sales person product 
Total revenue per day

8. GOOD TO HAVE

Global exception handling

Pagination for product listing

Sorting by price

Simple unit test for stock deduction

Order summary API

Top 5 selling products API

