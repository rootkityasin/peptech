--
-- PostgreSQL database dump
--


-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--



--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "pg_trgm";


--
-- Name: EXTENSION "pg_trgm"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "pg_trgm" IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "unaccent";


--
-- Name: EXTENSION "unaccent"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "unaccent" IS 'text search dictionary that removes accents';


--
-- Name: claim_reason_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."claim_reason_enum" AS ENUM (
    'missing_item',
    'wrong_item',
    'production_failure',
    'other'
);


--
-- Name: order_claim_type_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."order_claim_type_enum" AS ENUM (
    'refund',
    'replace'
);


--
-- Name: order_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."order_status_enum" AS ENUM (
    'pending',
    'completed',
    'draft',
    'archived',
    'canceled',
    'requires_action'
);


--
-- Name: return_status_enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."return_status_enum" AS ENUM (
    'open',
    'requested',
    'received',
    'partially_received',
    'canceled'
);


--
-- Name: medusa_search_english; Type: TEXT SEARCH CONFIGURATION; Schema: public; Owner: -
--

CREATE TEXT SEARCH CONFIGURATION "public"."medusa_search_english" (
    PARSER = "pg_catalog"."default" );

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "asciiword" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "word" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "numword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "email" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "url" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "host" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "sfloat" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "version" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "hword_numpart" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "hword_part" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "hword_asciipart" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "numhword" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "asciihword" WITH "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "hword" WITH "public"."unaccent", "english_stem";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "url_path" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "file" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "float" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "int" WITH "simple";

ALTER TEXT SEARCH CONFIGURATION "public"."medusa_search_english"
    ADD MAPPING FOR "uint" WITH "simple";


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: account_holder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."account_holder" (
    "id" "text" NOT NULL,
    "provider_id" "text" NOT NULL,
    "external_id" "text" NOT NULL,
    "email" "text",
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: api_key; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."api_key" (
    "id" "text" NOT NULL,
    "token" "text" NOT NULL,
    "salt" "text" NOT NULL,
    "redacted" "text" NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "last_used_at" timestamp with time zone,
    "created_by" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "revoked_by" "text",
    "revoked_at" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "api_key_type_check" CHECK (("type" = ANY (ARRAY['publishable'::"text", 'secret'::"text"])))
);


--
-- Name: application_method_buy_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_method_buy_rules" (
    "application_method_id" "text" NOT NULL,
    "promotion_rule_id" "text" NOT NULL
);


--
-- Name: application_method_target_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_method_target_rules" (
    "application_method_id" "text" NOT NULL,
    "promotion_rule_id" "text" NOT NULL
);


--
-- Name: auth_identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."auth_identity" (
    "id" "text" NOT NULL,
    "app_metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: auth_mfa_factor; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."auth_mfa_factor" (
    "id" "text" NOT NULL,
    "auth_identity_id" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "status" "text" NOT NULL,
    "provider_metadata" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: auth_mfa_recovery_code; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."auth_mfa_recovery_code" (
    "id" "text" NOT NULL,
    "auth_identity_id" "text" NOT NULL,
    "code_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: auth_password_reset_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."auth_password_reset_token" (
    "id" "text" NOT NULL,
    "auth_identity_id" "text" NOT NULL,
    "provider_identity_id" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "token_hash" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: auth_verification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."auth_verification" (
    "id" "text" NOT NULL,
    "auth_identity_id" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "entity_type" "text" NOT NULL,
    "code_provider" "text" NOT NULL,
    "verified_at" timestamp with time zone,
    "requested_at" timestamp with time zone NOT NULL,
    "provider_metadata" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: capture; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."capture" (
    "id" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "payment_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_by" "text",
    "metadata" "jsonb"
);


--
-- Name: cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart" (
    "id" "text" NOT NULL,
    "region_id" "text",
    "customer_id" "text",
    "sales_channel_id" "text",
    "email" "text",
    "currency_code" "text" NOT NULL,
    "shipping_address_id" "text",
    "billing_address_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "locale" "text"
);


--
-- Name: cart_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_address" (
    "id" "text" NOT NULL,
    "customer_id" "text",
    "company" "text",
    "first_name" "text",
    "last_name" "text",
    "address_1" "text",
    "address_2" "text",
    "city" "text",
    "country_code" "text",
    "province" "text",
    "postal_code" "text",
    "phone" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: cart_line_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_line_item" (
    "id" "text" NOT NULL,
    "cart_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "subtitle" "text",
    "thumbnail" "text",
    "quantity" integer NOT NULL,
    "variant_id" "text",
    "product_id" "text",
    "product_title" "text",
    "product_description" "text",
    "product_subtitle" "text",
    "product_type" "text",
    "product_collection" "text",
    "product_handle" "text",
    "variant_sku" "text",
    "variant_barcode" "text",
    "variant_title" "text",
    "variant_option_values" "jsonb",
    "requires_shipping" boolean DEFAULT true NOT NULL,
    "is_discountable" boolean DEFAULT true NOT NULL,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "compare_at_unit_price" numeric,
    "raw_compare_at_unit_price" "jsonb",
    "unit_price" numeric NOT NULL,
    "raw_unit_price" "jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "product_type_id" "text",
    "is_custom_price" boolean DEFAULT false NOT NULL,
    "is_giftcard" boolean DEFAULT false NOT NULL,
    CONSTRAINT "cart_line_item_unit_price_check" CHECK (("unit_price" >= (0)::numeric))
);


--
-- Name: cart_line_item_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_line_item_adjustment" (
    "id" "text" NOT NULL,
    "description" "text",
    "promotion_id" "text",
    "code" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "provider_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "item_id" "text",
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    CONSTRAINT "cart_line_item_adjustment_check" CHECK (("amount" >= (0)::numeric))
);


--
-- Name: cart_line_item_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_line_item_tax_line" (
    "id" "text" NOT NULL,
    "description" "text",
    "tax_rate_id" "text",
    "code" "text" NOT NULL,
    "rate" real NOT NULL,
    "provider_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "item_id" "text",
    "data" "jsonb"
);


--
-- Name: cart_payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_payment_collection" (
    "cart_id" character varying(255) NOT NULL,
    "payment_collection_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: cart_promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_promotion" (
    "cart_id" character varying(255) NOT NULL,
    "promotion_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: cart_shipping_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_shipping_method" (
    "id" "text" NOT NULL,
    "cart_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "jsonb",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "shipping_option_id" "text",
    "data" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "cart_shipping_method_check" CHECK (("amount" >= (0)::numeric))
);


--
-- Name: cart_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_shipping_method_adjustment" (
    "id" "text" NOT NULL,
    "description" "text",
    "promotion_id" "text",
    "code" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "provider_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "shipping_method_id" "text"
);


--
-- Name: cart_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."cart_shipping_method_tax_line" (
    "id" "text" NOT NULL,
    "description" "text",
    "tax_rate_id" "text",
    "code" "text" NOT NULL,
    "rate" real NOT NULL,
    "provider_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "shipping_method_id" "text",
    "data" "jsonb"
);


--
-- Name: credit_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."credit_line" (
    "id" "text" NOT NULL,
    "cart_id" "text" NOT NULL,
    "reference" "text",
    "reference_id" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."currency" (
    "code" "text" NOT NULL,
    "symbol" "text" NOT NULL,
    "symbol_native" "text" NOT NULL,
    "decimal_digits" integer DEFAULT 0 NOT NULL,
    "rounding" numeric DEFAULT 0 NOT NULL,
    "raw_rounding" "jsonb" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customer" (
    "id" "text" NOT NULL,
    "company_name" "text",
    "first_name" "text",
    "last_name" "text",
    "email" "text",
    "phone" "text",
    "has_account" boolean DEFAULT false NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_by" "text"
);


--
-- Name: customer_account_holder; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customer_account_holder" (
    "customer_id" character varying(255) NOT NULL,
    "account_holder_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: customer_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customer_address" (
    "id" "text" NOT NULL,
    "customer_id" "text" NOT NULL,
    "address_name" "text",
    "is_default_shipping" boolean DEFAULT false NOT NULL,
    "is_default_billing" boolean DEFAULT false NOT NULL,
    "company" "text",
    "first_name" "text",
    "last_name" "text",
    "address_1" "text",
    "address_2" "text",
    "city" "text",
    "country_code" "text",
    "province" "text",
    "postal_code" "text",
    "phone" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: customer_group; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customer_group" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "metadata" "jsonb",
    "created_by" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: customer_group_customer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customer_group_customer" (
    "id" "text" NOT NULL,
    "customer_id" "text" NOT NULL,
    "customer_group_id" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text",
    "deleted_at" timestamp with time zone
);


--
-- Name: fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment" (
    "id" "text" NOT NULL,
    "location_id" "text" NOT NULL,
    "packed_at" timestamp with time zone,
    "shipped_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "data" "jsonb",
    "provider_id" "text",
    "shipping_option_id" "text",
    "metadata" "jsonb",
    "delivery_address_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "marked_shipped_by" "text",
    "created_by" "text",
    "requires_shipping" boolean DEFAULT true NOT NULL
);


--
-- Name: fulfillment_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment_address" (
    "id" "text" NOT NULL,
    "company" "text",
    "first_name" "text",
    "last_name" "text",
    "address_1" "text",
    "address_2" "text",
    "city" "text",
    "country_code" "text",
    "province" "text",
    "postal_code" "text",
    "phone" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: fulfillment_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment_item" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "sku" "text" NOT NULL,
    "barcode" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "raw_quantity" "jsonb" NOT NULL,
    "line_item_id" "text",
    "inventory_item_id" "text",
    "fulfillment_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: fulfillment_label; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment_label" (
    "id" "text" NOT NULL,
    "tracking_number" "text" NOT NULL,
    "tracking_url" "text" NOT NULL,
    "label_url" "text" NOT NULL,
    "fulfillment_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: fulfillment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment_provider" (
    "id" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: fulfillment_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fulfillment_set" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: geo_zone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."geo_zone" (
    "id" "text" NOT NULL,
    "type" "text" DEFAULT 'country'::"text" NOT NULL,
    "country_code" "text" NOT NULL,
    "province_code" "text",
    "city" "text",
    "service_zone_id" "text" NOT NULL,
    "postal_expression" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "geo_zone_type_check" CHECK (("type" = ANY (ARRAY['country'::"text", 'province'::"text", 'city'::"text", 'zip'::"text"])))
);


--
-- Name: image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."image" (
    "id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "rank" integer DEFAULT 0 NOT NULL,
    "product_id" "text" NOT NULL
);


--
-- Name: inventory_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."inventory_item" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "sku" "text",
    "origin_country" "text",
    "hs_code" "text",
    "mid_code" "text",
    "material" "text",
    "weight" integer,
    "length" integer,
    "height" integer,
    "width" integer,
    "requires_shipping" boolean DEFAULT true NOT NULL,
    "description" "text",
    "title" "text",
    "thumbnail" "text",
    "metadata" "jsonb",
    "unit_of_measure" "text"
);


--
-- Name: inventory_level; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."inventory_level" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "inventory_item_id" "text" NOT NULL,
    "location_id" "text" NOT NULL,
    "stocked_quantity" numeric DEFAULT 0 NOT NULL,
    "reserved_quantity" numeric DEFAULT 0 NOT NULL,
    "incoming_quantity" numeric DEFAULT 0 NOT NULL,
    "metadata" "jsonb",
    "raw_stocked_quantity" "jsonb",
    "raw_reserved_quantity" "jsonb",
    "raw_incoming_quantity" "jsonb"
);


--
-- Name: invite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."invite" (
    "id" "text" NOT NULL,
    "email" "text" NOT NULL,
    "accepted" boolean DEFAULT false NOT NULL,
    "token" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: invite_rbac_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."invite_rbac_role" (
    "invite_id" character varying(255) NOT NULL,
    "rbac_role_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: layout_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."layout_configuration" (
    "id" "text" NOT NULL,
    "zone" "text" NOT NULL,
    "user_id" "text",
    "is_system_default" boolean DEFAULT false NOT NULL,
    "configuration" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: link_module_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."link_module_migrations" (
    "id" integer NOT NULL,
    "table_name" character varying(255) NOT NULL,
    "link_descriptor" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."link_module_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."link_module_migrations_id_seq" OWNED BY "public"."link_module_migrations"."id";


--
-- Name: location_fulfillment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."location_fulfillment_provider" (
    "stock_location_id" character varying(255) NOT NULL,
    "fulfillment_provider_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: location_fulfillment_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."location_fulfillment_set" (
    "stock_location_id" character varying(255) NOT NULL,
    "fulfillment_set_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: mikro_orm_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."mikro_orm_migrations" (
    "id" integer NOT NULL,
    "name" character varying(255),
    "executed_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."mikro_orm_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."mikro_orm_migrations_id_seq" OWNED BY "public"."mikro_orm_migrations"."id";


--
-- Name: notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notification" (
    "id" "text" NOT NULL,
    "to" "text" NOT NULL,
    "channel" "text" NOT NULL,
    "template" "text",
    "data" "jsonb",
    "trigger_type" "text",
    "resource_id" "text",
    "resource_type" "text",
    "receiver_id" "text",
    "original_notification_id" "text",
    "idempotency_key" "text",
    "external_id" "text",
    "provider_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "from" "text",
    "provider_data" "jsonb",
    CONSTRAINT "notification_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'success'::"text", 'failure'::"text"])))
);


--
-- Name: notification_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notification_provider" (
    "id" "text" NOT NULL,
    "handle" "text" NOT NULL,
    "name" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "channels" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order" (
    "id" "text" NOT NULL,
    "region_id" "text",
    "display_id" integer,
    "customer_id" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "sales_channel_id" "text",
    "status" "public"."order_status_enum" DEFAULT 'pending'::"public"."order_status_enum" NOT NULL,
    "is_draft_order" boolean DEFAULT false NOT NULL,
    "email" "text",
    "currency_code" "text" NOT NULL,
    "shipping_address_id" "text",
    "billing_address_id" "text",
    "no_notification" boolean,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "custom_display_id" "text",
    "locale" "text"
);


--
-- Name: order_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_address" (
    "id" "text" NOT NULL,
    "customer_id" "text",
    "company" "text",
    "first_name" "text",
    "last_name" "text",
    "address_1" "text",
    "address_2" "text",
    "city" "text",
    "country_code" "text",
    "province" "text",
    "postal_code" "text",
    "phone" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_cart; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_cart" (
    "order_id" character varying(255) NOT NULL,
    "cart_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_change; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_change" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "version" integer NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "internal_note" "text",
    "created_by" "text",
    "requested_by" "text",
    "requested_at" timestamp with time zone,
    "confirmed_by" "text",
    "confirmed_at" timestamp with time zone,
    "declined_by" "text",
    "declined_reason" "text",
    "metadata" "jsonb",
    "declined_at" timestamp with time zone,
    "canceled_by" "text",
    "canceled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "change_type" "text",
    "deleted_at" timestamp with time zone,
    "return_id" "text",
    "claim_id" "text",
    "exchange_id" "text",
    "carry_over_promotions" boolean,
    "no_notification" boolean,
    CONSTRAINT "order_change_status_check" CHECK (("status" = ANY (ARRAY['confirmed'::"text", 'declined'::"text", 'requested'::"text", 'pending'::"text", 'canceled'::"text"])))
);


--
-- Name: order_change_action; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_change_action" (
    "id" "text" NOT NULL,
    "order_id" "text",
    "version" integer,
    "ordering" bigint NOT NULL,
    "order_change_id" "text",
    "reference" "text",
    "reference_id" "text",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "amount" numeric,
    "raw_amount" "jsonb",
    "internal_note" "text",
    "applied" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "return_id" "text",
    "claim_id" "text",
    "exchange_id" "text"
);


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."order_change_action_ordering_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."order_change_action_ordering_seq" OWNED BY "public"."order_change_action"."ordering";


--
-- Name: order_claim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_claim" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "return_id" "text",
    "order_version" integer NOT NULL,
    "display_id" integer NOT NULL,
    "type" "public"."order_claim_type_enum" NOT NULL,
    "no_notification" boolean,
    "refund_amount" numeric,
    "raw_refund_amount" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "created_by" "text"
);


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."order_claim_display_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."order_claim_display_id_seq" OWNED BY "public"."order_claim"."display_id";


--
-- Name: order_claim_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_claim_item" (
    "id" "text" NOT NULL,
    "claim_id" "text" NOT NULL,
    "item_id" "text" NOT NULL,
    "is_additional_item" boolean DEFAULT false NOT NULL,
    "reason" "public"."claim_reason_enum",
    "quantity" numeric NOT NULL,
    "raw_quantity" "jsonb" NOT NULL,
    "note" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_claim_item_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_claim_item_image" (
    "id" "text" NOT NULL,
    "claim_item_id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_credit_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_credit_line" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "reference" "text",
    "reference_id" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "version" integer DEFAULT 1 NOT NULL
);


--
-- Name: order_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."order_display_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."order_display_id_seq" OWNED BY "public"."order"."display_id";


--
-- Name: order_exchange; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_exchange" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "return_id" "text",
    "order_version" integer NOT NULL,
    "display_id" integer NOT NULL,
    "no_notification" boolean,
    "allow_backorder" boolean DEFAULT false NOT NULL,
    "difference_due" numeric,
    "raw_difference_due" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "created_by" "text"
);


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."order_exchange_display_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."order_exchange_display_id_seq" OWNED BY "public"."order_exchange"."display_id";


--
-- Name: order_exchange_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_exchange_item" (
    "id" "text" NOT NULL,
    "exchange_id" "text" NOT NULL,
    "item_id" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "raw_quantity" "jsonb" NOT NULL,
    "note" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_fulfillment" (
    "order_id" character varying(255) NOT NULL,
    "fulfillment_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_item" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "version" integer NOT NULL,
    "item_id" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "raw_quantity" "jsonb" NOT NULL,
    "fulfilled_quantity" numeric NOT NULL,
    "raw_fulfilled_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "shipped_quantity" numeric NOT NULL,
    "raw_shipped_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "return_requested_quantity" numeric NOT NULL,
    "raw_return_requested_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "return_received_quantity" numeric NOT NULL,
    "raw_return_received_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "return_dismissed_quantity" numeric NOT NULL,
    "raw_return_dismissed_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "written_off_quantity" numeric NOT NULL,
    "raw_written_off_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "delivered_quantity" numeric DEFAULT 0 NOT NULL,
    "raw_delivered_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "unit_price" numeric,
    "raw_unit_price" "jsonb",
    "compare_at_unit_price" numeric,
    "raw_compare_at_unit_price" "jsonb"
);


--
-- Name: order_line_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_line_item" (
    "id" "text" NOT NULL,
    "totals_id" "text",
    "title" "text" NOT NULL,
    "subtitle" "text",
    "thumbnail" "text",
    "variant_id" "text",
    "product_id" "text",
    "product_title" "text",
    "product_description" "text",
    "product_subtitle" "text",
    "product_type" "text",
    "product_collection" "text",
    "product_handle" "text",
    "variant_sku" "text",
    "variant_barcode" "text",
    "variant_title" "text",
    "variant_option_values" "jsonb",
    "requires_shipping" boolean DEFAULT true NOT NULL,
    "is_discountable" boolean DEFAULT true NOT NULL,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "compare_at_unit_price" numeric,
    "raw_compare_at_unit_price" "jsonb",
    "unit_price" numeric NOT NULL,
    "raw_unit_price" "jsonb" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_custom_price" boolean DEFAULT false NOT NULL,
    "product_type_id" "text",
    "is_giftcard" boolean DEFAULT false NOT NULL
);


--
-- Name: order_line_item_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_line_item_adjustment" (
    "id" "text" NOT NULL,
    "description" "text",
    "promotion_id" "text",
    "code" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "provider_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "item_id" "text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "version" integer DEFAULT 1 NOT NULL
);


--
-- Name: order_line_item_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_line_item_tax_line" (
    "id" "text" NOT NULL,
    "description" "text",
    "tax_rate_id" "text",
    "code" "text" NOT NULL,
    "rate" numeric NOT NULL,
    "raw_rate" "jsonb" NOT NULL,
    "provider_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "item_id" "text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "metadata" "jsonb",
    "data" "jsonb"
);


--
-- Name: order_payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_payment_collection" (
    "order_id" character varying(255) NOT NULL,
    "payment_collection_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_promotion" (
    "order_id" character varying(255) NOT NULL,
    "promotion_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_shipping; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_shipping" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "version" integer NOT NULL,
    "shipping_method_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "return_id" "text",
    "claim_id" "text",
    "exchange_id" "text"
);


--
-- Name: order_shipping_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_shipping_method" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "jsonb",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "shipping_option_id" "text",
    "data" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_custom_amount" boolean DEFAULT false NOT NULL
);


--
-- Name: order_shipping_method_adjustment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_shipping_method_adjustment" (
    "id" "text" NOT NULL,
    "description" "text",
    "promotion_id" "text",
    "code" "text",
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "provider_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "shipping_method_id" "text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "version" integer DEFAULT 1 NOT NULL
);


--
-- Name: order_shipping_method_tax_line; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_shipping_method_tax_line" (
    "id" "text" NOT NULL,
    "description" "text",
    "tax_rate_id" "text",
    "code" "text" NOT NULL,
    "rate" numeric NOT NULL,
    "raw_rate" "jsonb" NOT NULL,
    "provider_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "shipping_method_id" "text" NOT NULL,
    "deleted_at" timestamp with time zone,
    "metadata" "jsonb",
    "data" "jsonb"
);


--
-- Name: order_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_summary" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "totals" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: order_transaction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."order_transaction" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "currency_code" "text" NOT NULL,
    "reference" "text",
    "reference_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "return_id" "text",
    "claim_id" "text",
    "exchange_id" "text"
);


--
-- Name: payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payment" (
    "id" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "currency_code" "text" NOT NULL,
    "provider_id" "text" CONSTRAINT "payment_provider_id_not_null1" NOT NULL,
    "data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "captured_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "payment_collection_id" "text" NOT NULL,
    "payment_session_id" "text" NOT NULL,
    "metadata" "jsonb"
);


--
-- Name: payment_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payment_collection" (
    "id" "text" NOT NULL,
    "currency_code" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "authorized_amount" numeric,
    "raw_authorized_amount" "jsonb",
    "captured_amount" numeric,
    "raw_captured_amount" "jsonb",
    "refunded_amount" numeric,
    "raw_refunded_amount" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "status" "text" DEFAULT 'not_paid'::"text" NOT NULL,
    "metadata" "jsonb",
    CONSTRAINT "payment_collection_status_check" CHECK (("status" = ANY (ARRAY['not_paid'::"text", 'awaiting'::"text", 'authorized'::"text", 'partially_authorized'::"text", 'canceled'::"text", 'failed'::"text", 'partially_captured'::"text", 'completed'::"text"])))
);


--
-- Name: payment_collection_payment_providers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payment_collection_payment_providers" (
    "payment_collection_id" "text" CONSTRAINT "payment_collection_payment_provi_payment_collection_id_not_null" NOT NULL,
    "payment_provider_id" "text" CONSTRAINT "payment_collection_payment_provide_payment_provider_id_not_null" NOT NULL
);


--
-- Name: payment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payment_provider" (
    "id" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: payment_session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."payment_session" (
    "id" "text" NOT NULL,
    "currency_code" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "provider_id" "text" NOT NULL,
    "data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "context" "jsonb",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "authorized_at" timestamp with time zone,
    "payment_collection_id" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "payment_session_status_check" CHECK (("status" = ANY (ARRAY['authorized'::"text", 'captured'::"text", 'pending'::"text", 'requires_more'::"text", 'error'::"text", 'canceled'::"text", 'pending_authorization'::"text"])))
);


--
-- Name: price; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price" (
    "id" "text" NOT NULL,
    "title" "text",
    "price_set_id" "text" NOT NULL,
    "currency_code" "text" CONSTRAINT "price_money_amount_id_not_null" NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "rules_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "price_list_id" "text",
    "amount" numeric NOT NULL,
    "min_quantity" numeric,
    "max_quantity" numeric,
    "raw_min_quantity" "jsonb",
    "raw_max_quantity" "jsonb"
);


--
-- Name: price_list; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price_list" (
    "id" "text" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "rules_count" integer DEFAULT 0,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "text" DEFAULT 'sale'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "metadata" "jsonb",
    CONSTRAINT "price_list_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'draft'::"text"]))),
    CONSTRAINT "price_list_type_check" CHECK (("type" = ANY (ARRAY['sale'::"text", 'override'::"text"])))
);


--
-- Name: price_list_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price_list_rule" (
    "id" "text" NOT NULL,
    "price_list_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "value" "jsonb",
    "attribute" "text" DEFAULT ''::"text" NOT NULL
);


--
-- Name: price_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price_preference" (
    "id" "text" NOT NULL,
    "attribute" "text" NOT NULL,
    "value" "text",
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: price_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price_rule" (
    "id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "price_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "attribute" "text" DEFAULT ''::"text" NOT NULL,
    "operator" "text" DEFAULT 'eq'::"text" NOT NULL,
    CONSTRAINT "price_rule_operator_check" CHECK (("operator" = ANY (ARRAY['gte'::"text", 'lte'::"text", 'gt'::"text", 'lt'::"text", 'eq'::"text"])))
);


--
-- Name: price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."price_set" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "handle" "text" NOT NULL,
    "subtitle" "text",
    "description" "text",
    "is_giftcard" boolean DEFAULT false NOT NULL,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "thumbnail" "text",
    "weight" real,
    "length" real,
    "height" real,
    "width" real,
    "origin_country" "text",
    "hs_code" "text",
    "mid_code" "text",
    "material" "text",
    "collection_id" "text",
    "type_id" "text",
    "discountable" boolean DEFAULT true NOT NULL,
    "external_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "metadata" "jsonb",
    CONSTRAINT "product_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'proposed'::"text", 'published'::"text", 'rejected'::"text"])))
);


--
-- Name: product_category; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_category" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "handle" "text" NOT NULL,
    "mpath" "text" NOT NULL,
    "is_active" boolean DEFAULT false NOT NULL,
    "is_internal" boolean DEFAULT false NOT NULL,
    "rank" integer DEFAULT 0 NOT NULL,
    "parent_category_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "metadata" "jsonb",
    "external_id" "text"
);


--
-- Name: product_category_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_category_product" (
    "product_id" "text" NOT NULL,
    "product_category_id" "text" NOT NULL
);


--
-- Name: product_collection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_collection" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "handle" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "external_id" "text"
);


--
-- Name: product_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_option" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "is_exclusive" boolean DEFAULT false NOT NULL
);


--
-- Name: product_option_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_option_value" (
    "id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "option_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "rank" integer
);


--
-- Name: product_product_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_product_option" (
    "id" "text" NOT NULL,
    "product_id" "text" NOT NULL,
    "product_option_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_product_option_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_product_option_value" (
    "id" "text" NOT NULL,
    "product_product_option_id" "text" NOT NULL,
    "product_option_value_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_sales_channel" (
    "product_id" character varying(255) NOT NULL,
    "sales_channel_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_shipping_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_shipping_profile" (
    "product_id" character varying(255) NOT NULL,
    "shipping_profile_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_tag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_tag" (
    "id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "external_id" "text"
);


--
-- Name: product_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_tags" (
    "product_id" "text" NOT NULL,
    "product_tag_id" "text" NOT NULL
);


--
-- Name: product_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_type" (
    "id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "metadata" json,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "external_id" "text"
);


--
-- Name: product_variant; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_variant" (
    "id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "sku" "text",
    "barcode" "text",
    "ean" "text",
    "upc" "text",
    "allow_backorder" boolean DEFAULT false NOT NULL,
    "manage_inventory" boolean DEFAULT true NOT NULL,
    "hs_code" "text",
    "origin_country" "text",
    "mid_code" "text",
    "material" "text",
    "weight" real,
    "length" real,
    "height" real,
    "width" real,
    "metadata" "jsonb",
    "variant_rank" integer DEFAULT 0,
    "product_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "thumbnail" "text"
);


--
-- Name: product_variant_inventory_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_variant_inventory_item" (
    "variant_id" character varying(255) NOT NULL,
    "inventory_item_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "required_quantity" numeric DEFAULT 1 NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_variant_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_variant_option" (
    "variant_id" "text" NOT NULL,
    "option_value_id" "text" NOT NULL
);


--
-- Name: product_variant_price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_variant_price_set" (
    "variant_id" character varying(255) NOT NULL,
    "price_set_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: product_variant_product_image; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_variant_product_image" (
    "id" "text" NOT NULL,
    "variant_id" "text" NOT NULL,
    "image_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: promotion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion" (
    "id" "text" NOT NULL,
    "code" "text" NOT NULL,
    "campaign_id" "text",
    "is_automatic" boolean DEFAULT false NOT NULL,
    "type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "is_tax_inclusive" boolean DEFAULT false NOT NULL,
    "limit" integer,
    "used" integer DEFAULT 0 NOT NULL,
    "metadata" "jsonb",
    CONSTRAINT "promotion_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'active'::"text", 'inactive'::"text"]))),
    CONSTRAINT "promotion_type_check" CHECK (("type" = ANY (ARRAY['standard'::"text", 'buyget'::"text"])))
);


--
-- Name: promotion_application_method; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_application_method" (
    "id" "text" NOT NULL,
    "value" numeric,
    "raw_value" "jsonb",
    "max_quantity" integer,
    "apply_to_quantity" integer,
    "buy_rules_min_quantity" integer,
    "type" "text" NOT NULL,
    "target_type" "text" NOT NULL,
    "allocation" "text",
    "promotion_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "currency_code" "text",
    CONSTRAINT "promotion_application_method_allocation_check" CHECK (("allocation" = ANY (ARRAY['each'::"text", 'across'::"text", 'once'::"text"]))),
    CONSTRAINT "promotion_application_method_target_type_check" CHECK (("target_type" = ANY (ARRAY['order'::"text", 'shipping_methods'::"text", 'items'::"text"]))),
    CONSTRAINT "promotion_application_method_type_check" CHECK (("type" = ANY (ARRAY['fixed'::"text", 'percentage'::"text"])))
);


--
-- Name: promotion_campaign; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_campaign" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "campaign_identifier" "text" NOT NULL,
    "starts_at" timestamp with time zone,
    "ends_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: promotion_campaign_budget; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_campaign_budget" (
    "id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "campaign_id" "text" NOT NULL,
    "limit" numeric,
    "raw_limit" "jsonb",
    "used" numeric DEFAULT 0 NOT NULL,
    "raw_used" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "currency_code" "text",
    "attribute" "text",
    CONSTRAINT "promotion_campaign_budget_type_check" CHECK (("type" = ANY (ARRAY['spend'::"text", 'usage'::"text", 'use_by_attribute'::"text", 'spend_by_attribute'::"text"])))
);


--
-- Name: promotion_campaign_budget_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_campaign_budget_usage" (
    "id" "text" NOT NULL,
    "attribute_value" "text" NOT NULL,
    "used" numeric DEFAULT 0 NOT NULL,
    "budget_id" "text" NOT NULL,
    "raw_used" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: promotion_promotion_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_promotion_rule" (
    "promotion_id" "text" NOT NULL,
    "promotion_rule_id" "text" NOT NULL
);


--
-- Name: promotion_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_rule" (
    "id" "text" NOT NULL,
    "description" "text",
    "attribute" "text" NOT NULL,
    "operator" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "promotion_rule_operator_check" CHECK (("operator" = ANY (ARRAY['gte'::"text", 'lte'::"text", 'gt'::"text", 'lt'::"text", 'eq'::"text", 'ne'::"text", 'in'::"text"])))
);


--
-- Name: promotion_rule_value; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."promotion_rule_value" (
    "id" "text" NOT NULL,
    "promotion_rule_id" "text" NOT NULL,
    "value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: property_label; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."property_label" (
    "id" "text" NOT NULL,
    "entity" "text" NOT NULL,
    "property" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: provider_identity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."provider_identity" (
    "id" "text" NOT NULL,
    "entity_id" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "auth_identity_id" "text" NOT NULL,
    "user_metadata" "jsonb",
    "provider_metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: publishable_api_key_sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."publishable_api_key_sales_channel" (
    "publishable_key_id" character varying(255) NOT NULL,
    "sales_channel_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: refund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."refund" (
    "id" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "raw_amount" "jsonb" NOT NULL,
    "payment_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "created_by" "text",
    "metadata" "jsonb",
    "refund_reason_id" "text",
    "note" "text"
);


--
-- Name: refund_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."refund_reason" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "code" "text" NOT NULL
);


--
-- Name: region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."region" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "currency_code" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "automatic_taxes" boolean DEFAULT true NOT NULL
);


--
-- Name: region_country; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."region_country" (
    "iso_2" "text" NOT NULL,
    "iso_3" "text" NOT NULL,
    "num_code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "region_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: region_payment_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."region_payment_provider" (
    "region_id" character varying(255) NOT NULL,
    "payment_provider_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: reservation_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."reservation_item" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "line_item_id" "text",
    "location_id" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "external_id" "text",
    "description" "text",
    "created_by" "text",
    "metadata" "jsonb",
    "inventory_item_id" "text" NOT NULL,
    "allow_backorder" boolean DEFAULT false,
    "raw_quantity" "jsonb"
);


--
-- Name: return; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."return" (
    "id" "text" NOT NULL,
    "order_id" "text" NOT NULL,
    "claim_id" "text",
    "exchange_id" "text",
    "order_version" integer NOT NULL,
    "display_id" integer NOT NULL,
    "status" "public"."return_status_enum" DEFAULT 'open'::"public"."return_status_enum" NOT NULL,
    "no_notification" boolean,
    "refund_amount" numeric,
    "raw_refund_amount" "jsonb",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "received_at" timestamp with time zone,
    "canceled_at" timestamp with time zone,
    "location_id" "text",
    "requested_at" timestamp with time zone,
    "created_by" "text"
);


--
-- Name: return_display_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."return_display_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: return_display_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."return_display_id_seq" OWNED BY "public"."return"."display_id";


--
-- Name: return_fulfillment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."return_fulfillment" (
    "return_id" character varying(255) NOT NULL,
    "fulfillment_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: return_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."return_item" (
    "id" "text" NOT NULL,
    "return_id" "text" NOT NULL,
    "reason_id" "text",
    "item_id" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "raw_quantity" "jsonb" NOT NULL,
    "received_quantity" numeric DEFAULT 0 NOT NULL,
    "raw_received_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL,
    "note" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "damaged_quantity" numeric DEFAULT 0 NOT NULL,
    "raw_damaged_quantity" "jsonb" DEFAULT '{"value": "0", "precision": 20}'::"jsonb" NOT NULL
);


--
-- Name: return_reason; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."return_reason" (
    "id" character varying NOT NULL,
    "value" character varying NOT NULL,
    "label" character varying NOT NULL,
    "description" character varying,
    "metadata" "jsonb",
    "parent_return_reason_id" character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: sales_channel; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."sales_channel" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_disabled" boolean DEFAULT false NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: sales_channel_stock_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."sales_channel_stock_location" (
    "sales_channel_id" character varying(255) NOT NULL,
    "stock_location_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: script_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."script_migrations" (
    "id" integer NOT NULL,
    "script_name" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "finished_at" timestamp with time zone
);


--
-- Name: script_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."script_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: script_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."script_migrations_id_seq" OWNED BY "public"."script_migrations"."id";


--
-- Name: search_index; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."search_index" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "active_version" integer
);


--
-- Name: search_index_sync; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."search_index_sync" (
    "id" "text" NOT NULL,
    "job_id" "text",
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "filters" "jsonb",
    "last_key" "text",
    "documents_synced" integer DEFAULT 0 NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "error" "text",
    "search_index_version_id" "text" CONSTRAINT "search_index_sync_search_index_id_not_null" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "search_index_sync_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'processing'::"text", 'done'::"text", 'failed'::"text", 'canceled'::"text"])))
);


--
-- Name: search_index_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."search_index_version" (
    "id" "text" NOT NULL,
    "version" integer NOT NULL,
    "provider" "text" NOT NULL,
    "physical_name" "text" NOT NULL,
    "definition_hash" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "search_index_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "search_index_version_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'building'::"text", 'ready'::"text", 'error'::"text"])))
);


--
-- Name: search_postgres_index; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."search_postgres_index" (
    "name" "text" NOT NULL,
    "table_name" "text" NOT NULL,
    "schema_hash" "text" NOT NULL,
    "plan" "jsonb" NOT NULL,
    "document_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: service_zone; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."service_zone" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "metadata" "jsonb",
    "fulfillment_set_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: shipping_option; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shipping_option" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "price_type" "text" DEFAULT 'flat'::"text" NOT NULL,
    "service_zone_id" "text" NOT NULL,
    "shipping_profile_id" "text",
    "provider_id" "text",
    "data" "jsonb",
    "metadata" "jsonb",
    "shipping_option_type_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "shipping_option_price_type_check" CHECK (("price_type" = ANY (ARRAY['calculated'::"text", 'flat'::"text"])))
);


--
-- Name: shipping_option_price_set; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shipping_option_price_set" (
    "shipping_option_id" character varying(255) NOT NULL,
    "price_set_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: shipping_option_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shipping_option_rule" (
    "id" "text" NOT NULL,
    "attribute" "text" NOT NULL,
    "operator" "text" NOT NULL,
    "value" "jsonb",
    "shipping_option_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "shipping_option_rule_operator_check" CHECK (("operator" = ANY (ARRAY['in'::"text", 'eq'::"text", 'ne'::"text", 'gt'::"text", 'gte'::"text", 'lt'::"text", 'lte'::"text", 'nin'::"text"])))
);


--
-- Name: shipping_option_type; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shipping_option_type" (
    "id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: shipping_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."shipping_profile" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: stock_location; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."stock_location" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "name" "text" NOT NULL,
    "address_id" "text",
    "metadata" "jsonb"
);


--
-- Name: stock_location_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."stock_location_address" (
    "id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "address_1" "text" NOT NULL,
    "address_2" "text",
    "company" "text",
    "city" "text",
    "country_code" "text" NOT NULL,
    "phone" "text",
    "province" "text",
    "postal_code" "text",
    "metadata" "jsonb"
);


--
-- Name: store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."store" (
    "id" "text" NOT NULL,
    "name" "text" DEFAULT 'Medusa Store'::"text" NOT NULL,
    "default_sales_channel_id" "text",
    "default_region_id" "text",
    "default_location_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: store_currency; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."store_currency" (
    "id" "text" NOT NULL,
    "currency_code" "text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "store_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: store_locale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."store_locale" (
    "id" "text" NOT NULL,
    "locale_code" "text" NOT NULL,
    "store_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: tax_provider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tax_provider" (
    "id" "text" NOT NULL,
    "is_enabled" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: tax_rate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tax_rate" (
    "id" "text" NOT NULL,
    "rate" real,
    "code" "text" NOT NULL,
    "name" "text" NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "is_combinable" boolean DEFAULT false NOT NULL,
    "tax_region_id" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text",
    "deleted_at" timestamp with time zone
);


--
-- Name: tax_rate_rule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tax_rate_rule" (
    "id" "text" NOT NULL,
    "tax_rate_id" "text" NOT NULL,
    "reference_id" "text" NOT NULL,
    "reference" "text" NOT NULL,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text",
    "deleted_at" timestamp with time zone
);


--
-- Name: tax_region; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tax_region" (
    "id" "text" NOT NULL,
    "provider_id" "text",
    "country_code" "text" NOT NULL,
    "province_code" "text",
    "parent_id" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "text",
    "deleted_at" timestamp with time zone,
    CONSTRAINT "CK_tax_region_country_top_level" CHECK ((("parent_id" IS NULL) OR ("province_code" IS NOT NULL))),
    CONSTRAINT "CK_tax_region_provider_top_level" CHECK ((("parent_id" IS NULL) OR ("provider_id" IS NULL)))
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user" (
    "id" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text" NOT NULL,
    "avatar_url" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: user_preference; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_preference" (
    "id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: user_rbac_role; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."user_rbac_role" (
    "user_id" character varying(255) NOT NULL,
    "rbac_role_id" character varying(255) NOT NULL,
    "id" character varying(255) NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: view_configuration; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."view_configuration" (
    "id" "text" NOT NULL,
    "entity" "text" NOT NULL,
    "name" "text",
    "user_id" "text",
    "is_system_default" boolean DEFAULT false NOT NULL,
    "configuration" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


--
-- Name: workflow_execution; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."workflow_execution" (
    "id" character varying NOT NULL,
    "workflow_id" character varying NOT NULL,
    "transaction_id" character varying NOT NULL,
    "execution" "jsonb",
    "context" "jsonb",
    "state" character varying NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp without time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp without time zone,
    "retention_time" integer,
    "run_id" "text" DEFAULT '01M2AQAS33MJZFDXME2GCJ9CG1'::"text" NOT NULL
);


--
-- Name: link_module_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."link_module_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."link_module_migrations_id_seq"'::"regclass");


--
-- Name: mikro_orm_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."mikro_orm_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."mikro_orm_migrations_id_seq"'::"regclass");


--
-- Name: order display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order" ALTER COLUMN "display_id" SET DEFAULT "nextval"('"public"."order_display_id_seq"'::"regclass");


--
-- Name: order_change_action ordering; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_change_action" ALTER COLUMN "ordering" SET DEFAULT "nextval"('"public"."order_change_action_ordering_seq"'::"regclass");


--
-- Name: order_claim display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_claim" ALTER COLUMN "display_id" SET DEFAULT "nextval"('"public"."order_claim_display_id_seq"'::"regclass");


--
-- Name: order_exchange display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_exchange" ALTER COLUMN "display_id" SET DEFAULT "nextval"('"public"."order_exchange_display_id_seq"'::"regclass");


--
-- Name: return display_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return" ALTER COLUMN "display_id" SET DEFAULT "nextval"('"public"."return_display_id_seq"'::"regclass");


--
-- Name: script_migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."script_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."script_migrations_id_seq"'::"regclass");


--
-- Data for Name: account_holder; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: api_key; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."api_key" ("id", "token", "salt", "redacted", "title", "type", "last_used_at", "created_by", "created_at", "revoked_by", "revoked_at", "updated_at", "deleted_at") VALUES ('apk_01M2AQBJ72Q80GXWWT6PAW5741', 'pk_556de0f5ea4724394f147569c8b5066ecda7a0d39bd60eb15b2550b2d5c52246', '', 'pk_556***246', 'Default Publishable API Key', 'publishable', NULL, '', '2026-09-12 17:51:59.458+06', NULL, NULL, '2026-09-12 17:51:59.458+06', NULL);


--
-- Data for Name: application_method_buy_rules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: application_method_target_rules; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: auth_identity; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2AQBY6P6PMNRRV6XXKY6MCC', '{"user_id": "user_01M2AQBY1MKD7BCMDJRVBBMKJ8"}', '2026-09-12 17:52:11.734+06', '2026-09-12 17:52:11.756+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2TV9NFZRWQ7DP7VJDY5BZ4N', '{"customer_id": "cus_01M2TVB0Y5RZ90C0TAZBJWMQAZ"}', '2026-09-19 00:08:42.496+06', '2026-09-19 00:09:27.001+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2TVE4MAQ67MFWB177DJBVK7', '{"customer_id": "cus_01M2TVE4NNJPWDB9JJMXX6GNNM"}', '2026-09-19 00:11:09.066+06', '2026-09-19 00:11:09.12+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2TVRHQ95Y6JV1W7BE771YM8', '{"customer_id": "cus_01M2TVRHR5PAP99JYZB6H0XX5F"}', '2026-09-19 00:16:50.153+06', '2026-09-19 00:16:50.191+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2WKTMW654D8Y7XNTZN6GM18', '{"customer_id": "cus_01M2WKTMZVGKK0W5FA2WWYK2WZ"}', '2026-09-19 16:36:39.175+06', '2026-09-19 16:36:39.308+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2WKVW79JEAA2HNHPRDPHJG9', '{"customer_id": "cus_01M2WKVW9ASWZ72E3H39RVAHG0"}', '2026-09-19 16:37:19.465+06', '2026-09-19 16:37:19.544+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2WM0C49C0QPGEXPC0HM32DE', '{"customer_id": "cus_01M2WM0C5GEBXGWQQK0A8NW9RM"}', '2026-09-19 16:39:46.826+06', '2026-09-19 16:39:46.874+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2ZPTKV3CKKGMZ9CPFP092SG', '{"customer_id": "cus_01M2ZPTKYJW2WSPA7F4X5HPGAG"}', '2026-09-20 21:26:47.139+06', '2026-09-20 21:26:47.261+06', NULL);
INSERT INTO "public"."auth_identity" ("id", "app_metadata", "created_at", "updated_at", "deleted_at") VALUES ('authid_01M2ZQDD0KM2EC15NBW8YZS6T0', '{"customer_id": "cus_01M2ZQDD1RBE31CQ5B97SE1EF5"}', '2026-09-20 21:37:02.74+06', '2026-09-20 21:37:02.784+06', NULL);


--
-- Data for Name: auth_mfa_factor; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: auth_mfa_recovery_code; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: auth_password_reset_token; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: auth_verification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: capture; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."cart" ("id", "region_id", "customer_id", "sales_channel_id", "email", "currency_code", "shipping_address_id", "billing_address_id", "metadata", "created_at", "updated_at", "deleted_at", "completed_at", "locale") VALUES ('cart_01M2JNS8PS4MS3Z9NVC4DKWM4A', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', NULL, 'gbp', NULL, NULL, NULL, '2026-09-15 19:58:26.779+06', '2026-09-15 19:58:26.779+06', NULL, NULL, NULL);
INSERT INTO "public"."cart" ("id", "region_id", "customer_id", "sales_channel_id", "email", "currency_code", "shipping_address_id", "billing_address_id", "metadata", "created_at", "updated_at", "deleted_at", "completed_at", "locale") VALUES ('cart_01M2JPFW5HGWB9HCCKG8DQPTRV', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', NULL, 'gbp', NULL, NULL, NULL, '2026-09-15 20:10:47.601+06', '2026-09-15 20:10:47.601+06', NULL, NULL, NULL);


--
-- Data for Name: cart_address; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_line_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."cart_line_item" ("id", "cart_id", "title", "subtitle", "thumbnail", "quantity", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "product_type_id", "is_custom_price", "is_giftcard") VALUES ('cali_01M2JP904G8HMRZ0QCCF7BC6PB', 'cart_01M2JNS8PS4MS3Z9NVC4DKWM4A', 'Complete PEPTECH® Pen Set', 'Complete Starter Kit', 'http://localhost:3000/images/peptech/mockup2.webp', 1, 'variant_01M2JNFFFZHCRTZ293CB958ZYM', 'prod_01M2JNFFB778WNCQARVRDBAKVB', 'Complete PEPTECH® Pen Set', 'Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.', NULL, NULL, NULL, 'complete-pen-set', 'PPS-1000', NULL, 'Complete Starter Kit', NULL, true, true, false, NULL, NULL, 195, '{"value": "195", "precision": 20}', '{}', '2026-09-15 20:07:02.289+06', '2026-09-15 20:07:41.911+06', '2026-09-15 20:07:41.91+06', NULL, false, false);
INSERT INTO "public"."cart_line_item" ("id", "cart_id", "title", "subtitle", "thumbnail", "quantity", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "product_type_id", "is_custom_price", "is_giftcard") VALUES ('cali_01M2JPFWEFV9QHF7NJDPFZNH80', 'cart_01M2JPFW5HGWB9HCCKG8DQPTRV', 'Melatonin II Pen System', 'Melatonin II Starter Set', 'http://localhost:3000/images/peptech/front.webp', 1, 'variant_01M2JNFFG0TAACZ95JGRX5J4VS', 'prod_01M2JNFFB719H38XS9QVG62Q49', 'Melatonin II Pen System', 'Complete starter set with reusable precision pen and Melatonin II cartridge for mycotoxin detection.', NULL, NULL, NULL, 'pen-system-melatonin2', 'PEP-PEN-MELATONIN2', NULL, 'Melatonin II Starter Set', NULL, true, true, false, NULL, NULL, 195, '{"value": "195", "precision": 20}', '{}', '2026-09-15 20:10:47.888+06', '2026-09-15 20:10:48.11+06', '2026-09-15 20:10:48.109+06', NULL, false, false);


--
-- Data for Name: cart_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_promotion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_shipping_method; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: cart_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: credit_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: currency; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('usd', '$', '$', 2, 0, '{"value": "0", "precision": 20}', 'US Dollar', '2026-09-12 17:51:39.914+06', '2026-09-12 17:51:39.914+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('cad', 'CA$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Canadian Dollar', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('eur', '€', '€', 2, 0, '{"value": "0", "precision": 20}', 'Euro', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('aed', 'AED', 'د.إ.‏', 2, 0, '{"value": "0", "precision": 20}', 'United Arab Emirates Dirham', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('afn', 'Af', '؋', 0, 0, '{"value": "0", "precision": 20}', 'Afghan Afghani', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('all', 'ALL', 'Lek', 0, 0, '{"value": "0", "precision": 20}', 'Albanian Lek', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('amd', 'AMD', 'դր.', 0, 0, '{"value": "0", "precision": 20}', 'Armenian Dram', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('aoa', 'AOA', 'Kz', 2, 0, '{"value": "0", "precision": 20}', 'Angolan Kwanza', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ars', 'AR$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Argentine Peso', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('aud', 'AU$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Australian Dollar', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('azn', 'man.', 'ман.', 2, 0, '{"value": "0", "precision": 20}', 'Azerbaijani Manat', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bam', 'KM', 'KM', 2, 0, '{"value": "0", "precision": 20}', 'Bosnia-Herzegovina Convertible Mark', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bdt', 'Tk', '৳', 2, 0, '{"value": "0", "precision": 20}', 'Bangladeshi Taka', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bgn', 'BGN', 'лв.', 2, 0, '{"value": "0", "precision": 20}', 'Bulgarian Lev', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bhd', 'BD', 'د.ب.‏', 3, 0, '{"value": "0", "precision": 20}', 'Bahraini Dinar', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bif', 'FBu', 'FBu', 0, 0, '{"value": "0", "precision": 20}', 'Burundian Franc', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bnd', 'BN$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Brunei Dollar', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bob', 'Bs', 'Bs', 2, 0, '{"value": "0", "precision": 20}', 'Bolivian Boliviano', '2026-09-12 17:51:39.915+06', '2026-09-12 17:51:39.915+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('brl', 'R$', 'R$', 2, 0, '{"value": "0", "precision": 20}', 'Brazilian Real', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bwp', 'BWP', 'P', 2, 0, '{"value": "0", "precision": 20}', 'Botswanan Pula', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('byn', 'Br', 'руб.', 2, 0, '{"value": "0", "precision": 20}', 'Belarusian Ruble', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('bzd', 'BZ$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Belize Dollar', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('cdf', 'CDF', 'FrCD', 2, 0, '{"value": "0", "precision": 20}', 'Congolese Franc', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('chf', 'CHF', 'CHF', 2, 0.05, '{"value": "0.05", "precision": 20}', 'Swiss Franc', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('clp', 'CL$', '$', 0, 0, '{"value": "0", "precision": 20}', 'Chilean Peso', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('cny', 'CN¥', 'CN¥', 2, 0, '{"value": "0", "precision": 20}', 'Chinese Yuan', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('cop', 'CO$', '$', 0, 0, '{"value": "0", "precision": 20}', 'Colombian Peso', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('crc', '₡', '₡', 0, 0, '{"value": "0", "precision": 20}', 'Costa Rican Colón', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('cve', 'CV$', 'CV$', 2, 0, '{"value": "0", "precision": 20}', 'Cape Verdean Escudo', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('czk', 'Kč', 'Kč', 2, 0, '{"value": "0", "precision": 20}', 'Czech Republic Koruna', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('djf', 'Fdj', 'Fdj', 0, 0, '{"value": "0", "precision": 20}', 'Djiboutian Franc', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('dkk', 'Dkr', 'kr', 2, 0, '{"value": "0", "precision": 20}', 'Danish Krone', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('dop', 'RD$', 'RD$', 2, 0, '{"value": "0", "precision": 20}', 'Dominican Peso', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('dzd', 'DA', 'د.ج.‏', 2, 0, '{"value": "0", "precision": 20}', 'Algerian Dinar', '2026-09-12 17:51:39.916+06', '2026-09-12 17:51:39.916+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('eek', 'Ekr', 'kr', 2, 0, '{"value": "0", "precision": 20}', 'Estonian Kroon', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('egp', 'EGP', 'ج.م.‏', 2, 0, '{"value": "0", "precision": 20}', 'Egyptian Pound', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ern', 'Nfk', 'Nfk', 2, 0, '{"value": "0", "precision": 20}', 'Eritrean Nakfa', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('etb', 'Br', 'Br', 2, 0, '{"value": "0", "precision": 20}', 'Ethiopian Birr', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('gbp', '£', '£', 2, 0, '{"value": "0", "precision": 20}', 'British Pound Sterling', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('gel', 'GEL', 'GEL', 2, 0, '{"value": "0", "precision": 20}', 'Georgian Lari', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ghs', 'GH₵', 'GH₵', 2, 0, '{"value": "0", "precision": 20}', 'Ghanaian Cedi', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('gmd', 'D', 'D', 2, 0, '{"value": "0", "precision": 20}', 'Gambian Dalasi', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('gnf', 'FG', 'FG', 0, 0, '{"value": "0", "precision": 20}', 'Guinean Franc', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('gtq', 'GTQ', 'Q', 2, 0, '{"value": "0", "precision": 20}', 'Guatemalan Quetzal', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('hkd', 'HK$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Hong Kong Dollar', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('hnl', 'HNL', 'L', 2, 0, '{"value": "0", "precision": 20}', 'Honduran Lempira', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('hrk', 'kn', 'kn', 2, 0, '{"value": "0", "precision": 20}', 'Croatian Kuna', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('huf', 'Ft', 'Ft', 0, 0, '{"value": "0", "precision": 20}', 'Hungarian Forint', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('idr', 'Rp', 'Rp', 0, 0, '{"value": "0", "precision": 20}', 'Indonesian Rupiah', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ils', '₪', '₪', 2, 0, '{"value": "0", "precision": 20}', 'Israeli New Sheqel', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('inr', 'Rs', '₹', 2, 0, '{"value": "0", "precision": 20}', 'Indian Rupee', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('iqd', 'IQD', 'د.ع.‏', 0, 0, '{"value": "0", "precision": 20}', 'Iraqi Dinar', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('irr', 'IRR', '﷼', 0, 0, '{"value": "0", "precision": 20}', 'Iranian Rial', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('irt', 'IRT', 'تومان', 0, 0, '{"value": "0", "precision": 20}', 'Iranian Toman', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('isk', 'Ikr', 'kr', 0, 0, '{"value": "0", "precision": 20}', 'Icelandic Króna', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('jmd', 'J$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Jamaican Dollar', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('jod', 'JD', 'د.أ.‏', 3, 0, '{"value": "0", "precision": 20}', 'Jordanian Dinar', '2026-09-12 17:51:39.917+06', '2026-09-12 17:51:39.917+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('jpy', '¥', '￥', 0, 0, '{"value": "0", "precision": 20}', 'Japanese Yen', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('kes', 'Ksh', 'Ksh', 2, 0, '{"value": "0", "precision": 20}', 'Kenyan Shilling', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('khr', 'KHR', '៛', 2, 0, '{"value": "0", "precision": 20}', 'Cambodian Riel', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('kmf', 'CF', 'FC', 0, 0, '{"value": "0", "precision": 20}', 'Comorian Franc', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('krw', '₩', '₩', 0, 0, '{"value": "0", "precision": 20}', 'South Korean Won', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('kwd', 'KD', 'د.ك.‏', 3, 0, '{"value": "0", "precision": 20}', 'Kuwaiti Dinar', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('kzt', 'KZT', 'тңг.', 2, 0, '{"value": "0", "precision": 20}', 'Kazakhstani Tenge', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('lbp', 'LB£', 'ل.ل.‏', 0, 0, '{"value": "0", "precision": 20}', 'Lebanese Pound', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('lkr', 'SLRs', 'SL Re', 2, 0, '{"value": "0", "precision": 20}', 'Sri Lankan Rupee', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ltl', 'Lt', 'Lt', 2, 0, '{"value": "0", "precision": 20}', 'Lithuanian Litas', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('lvl', 'Ls', 'Ls', 2, 0, '{"value": "0", "precision": 20}', 'Latvian Lats', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('lyd', 'LD', 'د.ل.‏', 3, 0, '{"value": "0", "precision": 20}', 'Libyan Dinar', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mad', 'MAD', 'د.م.‏', 2, 0, '{"value": "0", "precision": 20}', 'Moroccan Dirham', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mdl', 'MDL', 'MDL', 2, 0, '{"value": "0", "precision": 20}', 'Moldovan Leu', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mga', 'MGA', 'MGA', 0, 0, '{"value": "0", "precision": 20}', 'Malagasy Ariary', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mkd', 'MKD', 'MKD', 2, 0, '{"value": "0", "precision": 20}', 'Macedonian Denar', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mmk', 'MMK', 'K', 0, 0, '{"value": "0", "precision": 20}', 'Myanma Kyat', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mnt', 'MNT', '₮', 0, 0, '{"value": "0", "precision": 20}', 'Mongolian Tugrig', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mop', 'MOP$', 'MOP$', 2, 0, '{"value": "0", "precision": 20}', 'Macanese Pataca', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mur', 'MURs', 'MURs', 0, 0, '{"value": "0", "precision": 20}', 'Mauritian Rupee', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mwk', 'K', 'K', 2, 0, '{"value": "0", "precision": 20}', 'Malawian Kwacha', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mxn', 'MX$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Mexican Peso', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('myr', 'RM', 'RM', 2, 0, '{"value": "0", "precision": 20}', 'Malaysian Ringgit', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('mzn', 'MTn', 'MTn', 2, 0, '{"value": "0", "precision": 20}', 'Mozambican Metical', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('nad', 'N$', 'N$', 2, 0, '{"value": "0", "precision": 20}', 'Namibian Dollar', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ngn', '₦', '₦', 2, 0, '{"value": "0", "precision": 20}', 'Nigerian Naira', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('nio', 'C$', 'C$', 2, 0, '{"value": "0", "precision": 20}', 'Nicaraguan Córdoba', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('nok', 'Nkr', 'kr', 2, 0, '{"value": "0", "precision": 20}', 'Norwegian Krone', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('npr', 'NPRs', 'नेरू', 2, 0, '{"value": "0", "precision": 20}', 'Nepalese Rupee', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('nzd', 'NZ$', '$', 2, 0, '{"value": "0", "precision": 20}', 'New Zealand Dollar', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('omr', 'OMR', 'ر.ع.‏', 3, 0, '{"value": "0", "precision": 20}', 'Omani Rial', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('pab', 'B/.', 'B/.', 2, 0, '{"value": "0", "precision": 20}', 'Panamanian Balboa', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('pen', 'S/.', 'S/.', 2, 0, '{"value": "0", "precision": 20}', 'Peruvian Nuevo Sol', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('php', '₱', '₱', 2, 0, '{"value": "0", "precision": 20}', 'Philippine Peso', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('pkr', 'PKRs', '₨', 0, 0, '{"value": "0", "precision": 20}', 'Pakistani Rupee', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('pln', 'zł', 'zł', 2, 0, '{"value": "0", "precision": 20}', 'Polish Zloty', '2026-09-12 17:51:39.918+06', '2026-09-12 17:51:39.918+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('pyg', '₲', '₲', 0, 0, '{"value": "0", "precision": 20}', 'Paraguayan Guarani', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('qar', 'QR', 'ر.ق.‏', 2, 0, '{"value": "0", "precision": 20}', 'Qatari Rial', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ron', 'RON', 'RON', 2, 0, '{"value": "0", "precision": 20}', 'Romanian Leu', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('rsd', 'din.', 'дин.', 0, 0, '{"value": "0", "precision": 20}', 'Serbian Dinar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('rub', 'RUB', '₽.', 2, 0, '{"value": "0", "precision": 20}', 'Russian Ruble', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('rwf', 'RWF', 'FR', 0, 0, '{"value": "0", "precision": 20}', 'Rwandan Franc', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('sar', 'SR', 'ر.س.‏', 2, 0, '{"value": "0", "precision": 20}', 'Saudi Riyal', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('sdg', 'SDG', 'SDG', 2, 0, '{"value": "0", "precision": 20}', 'Sudanese Pound', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('sek', 'Skr', 'kr', 2, 0, '{"value": "0", "precision": 20}', 'Swedish Krona', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('sgd', 'S$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Singapore Dollar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('sos', 'Ssh', 'Ssh', 0, 0, '{"value": "0", "precision": 20}', 'Somali Shilling', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('syp', 'SY£', 'ل.س.‏', 0, 0, '{"value": "0", "precision": 20}', 'Syrian Pound', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('thb', '฿', '฿', 2, 0, '{"value": "0", "precision": 20}', 'Thai Baht', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('tnd', 'DT', 'د.ت.‏', 3, 0, '{"value": "0", "precision": 20}', 'Tunisian Dinar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('top', 'T$', 'T$', 2, 0, '{"value": "0", "precision": 20}', 'Tongan Paʻanga', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('tjs', 'TJS', 'с.', 2, 0, '{"value": "0", "precision": 20}', 'Tajikistani Somoni', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('try', '₺', '₺', 2, 0, '{"value": "0", "precision": 20}', 'Turkish Lira', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ttd', 'TT$', '$', 2, 0, '{"value": "0", "precision": 20}', 'Trinidad and Tobago Dollar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('twd', 'NT$', 'NT$', 2, 0, '{"value": "0", "precision": 20}', 'New Taiwan Dollar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('tzs', 'TSh', 'TSh', 0, 0, '{"value": "0", "precision": 20}', 'Tanzanian Shilling', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('uah', '₴', '₴', 2, 0, '{"value": "0", "precision": 20}', 'Ukrainian Hryvnia', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('ugx', 'USh', 'USh', 0, 0, '{"value": "0", "precision": 20}', 'Ugandan Shilling', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('uyu', '$U', '$', 2, 0, '{"value": "0", "precision": 20}', 'Uruguayan Peso', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('uzs', 'UZS', 'UZS', 0, 0, '{"value": "0", "precision": 20}', 'Uzbekistan Som', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('vef', 'Bs.F.', 'Bs.F.', 2, 0, '{"value": "0", "precision": 20}', 'Venezuelan Bolívar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('vnd', '₫', '₫', 0, 0, '{"value": "0", "precision": 20}', 'Vietnamese Dong', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('xaf', 'FCFA', 'FCFA', 0, 0, '{"value": "0", "precision": 20}', 'CFA Franc BEAC', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('xof', 'CFA', 'CFA', 0, 0, '{"value": "0", "precision": 20}', 'CFA Franc BCEAO', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('xpf', '₣', '₣', 0, 0, '{"value": "0", "precision": 20}', 'CFP Franc', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('yer', 'YR', 'ر.ي.‏', 0, 0, '{"value": "0", "precision": 20}', 'Yemeni Rial', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('zar', 'R', 'R', 2, 0, '{"value": "0", "precision": 20}', 'South African Rand', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('zmk', 'ZK', 'ZK', 0, 0, '{"value": "0", "precision": 20}', 'Zambian Kwacha', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);
INSERT INTO "public"."currency" ("code", "symbol", "symbol_native", "decimal_digits", "rounding", "raw_rounding", "name", "created_at", "updated_at", "deleted_at") VALUES ('zwl', 'ZWL$', 'ZWL$', 0, 0, '{"value": "0", "precision": 20}', 'Zimbabwean Dollar', '2026-09-12 17:51:39.919+06', '2026-09-12 17:51:39.919+06', NULL);


--
-- Data for Name: customer; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2TVE4NNJPWDB9JJMXX6GNNM', 'Oxbridge Genomics Lab', 'Eleanor', 'Vance', 'test.researcher.1789755068860@cambridge.ac.uk', NULL, true, '{"title": "Dr.", "customer_id_code": "#PEP-CUST-9105"}', '2026-09-19 00:11:09.11+06', '2026-09-19 00:11:09.11+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2TVB0Y5RZ90C0TAZBJWMQAZ', 'Cambridge Biomedical Research Hub', 'Alexander', 'Wright', 'alexander.wright@cambridge-biotech.ac.uk', '+44 1223 928 401', true, '{"role": "Verified Clinical Researcher", "title": "Dr.", "avatar_url": "/images/figma/d7ba35eef589d74712ad429f3bd1612dfa66c973.png", "member_since": "Sep 2025", "customer_id_code": "#PEP-CUST-8402"}', '2026-09-19 00:09:26.982+06', '2026-09-19 00:11:29.592+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2TVRHR5PAP99JYZB6H0XX5F', 'Imperial Institute of Molecular Medicine', 'Eleanor', 'Vance', 'dr.vance.9981@imperial-genomics.ac.uk', '+44 20 7589 5111', true, '{"role": "Verified Clinical Researcher", "title": "Dr.", "avatar_url": null, "member_since": "Sep 2026", "customer_id_code": "#PEP-CUST-1959"}', '2026-09-19 00:16:50.182+06', '2026-09-19 00:16:50.182+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2WKTMZVGKK0W5FA2WWYK2WZ', 'Oxbridge Genomics Lab', 'Eleanor', 'Vance', 'test.researcher.1789814198929@cambridge.ac.uk', NULL, true, '{"title": "Dr.", "customer_id_code": "#PEP-CUST-9105"}', '2026-09-19 16:36:39.292+06', '2026-09-19 16:36:39.292+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2WKVW9ASWZ72E3H39RVAHG0', 'Oxford Peptide Laboratory', 'Marcus', 'Vance', 'prof.marcus.1789814239257@oxford.ac.uk', '+44 1865 999 111', true, '{"role": "Verified Clinical Researcher", "title": "Prof."}', '2026-09-19 16:37:19.531+06', '2026-09-19 16:37:19.531+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2WM0C5GEBXGWQQK0A8NW9RM', 'Oxford Laboratory for Molecular Biology', 'Clara', 'Oswald', 'dr.clara.1789814386628@oxford-genomics.ac.uk', '+44 1865 281 999', true, '{"role": "Verified Clinical Researcher", "title": "Dr.", "compliance_ack": true, "registered_via": "PEPTECH Storefront Portal", "customer_id_code": "#PEP-CUST-4852"}', '2026-09-19 16:39:46.864+06', '2026-09-19 16:39:46.864+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2ZPTKYJW2WSPA7F4X5HPGAG', 'uuu', 'Yasin', 'Arafat', 'yasinarafat6184@gmail.com', '+8801956378068', true, '{"role": "Verified Clinical Researcher", "title": "Mr.", "avatar_url": null, "member_since": "Sep 2026", "compliance_ack": true, "registered_via": "PEPTECH Storefront Portal", "customer_id_code": "#PEP-CUST-6329"}', '2026-09-20 21:26:47.25+06', '2026-09-20 21:26:47.25+06', NULL, NULL);
INSERT INTO "public"."customer" ("id", "company_name", "first_name", "last_name", "email", "phone", "has_account", "metadata", "created_at", "updated_at", "deleted_at", "created_by") VALUES ('cus_01M2ZQDD1RBE31CQ5B97SE1EF5', NULL, 'Test', 'User', 'testcustomer123@peptech.bio', NULL, true, '{"avatar_url": "https://example.com/my-photo.jpg"}', '2026-09-20 21:37:02.776+06', '2026-09-20 21:37:44.939+06', NULL, NULL);


--
-- Data for Name: customer_account_holder; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: customer_address; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."customer_address" ("id", "customer_id", "address_name", "is_default_shipping", "is_default_billing", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cuaddr_01M2TVBJV5GWNFV9MY45VQ3RJH', 'cus_01M2TVB0Y5RZ90C0TAZBJWMQAZ', NULL, true, true, 'Cambridge Biomedical Research Hub', 'Dr. Alexander', 'Wright', 'Cambridge Science Park, Milton Rd, Suite 4B', NULL, 'Cambridge', 'gb', NULL, 'CB4 0GZ', '+44 1223 928 401', NULL, '2026-09-19 00:09:45.318+06', '2026-09-19 00:09:45.318+06', NULL);
INSERT INTO "public"."customer_address" ("id", "customer_id", "address_name", "is_default_shipping", "is_default_billing", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cuaddr_01M2TVQ9GT27D3TYZ0E03Z6FCV', 'cus_01M2TVB0Y5RZ90C0TAZBJWMQAZ', 'Oxford Discovery Hub', false, false, 'Cambridge Biomedical Research Hub', 'Alexander', 'Wright', 'Old Road Campus, Roosevelt Dr', NULL, 'Oxford', 'gb', NULL, 'OX3 7FZ', '+44 1223 928 401', NULL, '2026-09-19 00:16:08.986+06', '2026-09-19 00:16:08.986+06', NULL);


--
-- Data for Name: customer_group; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: customer_group_customer; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: fulfillment_address; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: fulfillment_item; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: fulfillment_label; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."fulfillment_provider" ("id", "is_enabled", "created_at", "updated_at", "deleted_at") VALUES ('manual_manual', true, '2026-09-12 17:51:39.935+06', '2026-09-12 17:51:39.935+06', NULL);


--
-- Data for Name: fulfillment_set; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."fulfillment_set" ("id", "name", "type", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fuset_01M2AQBJCNM56GJ0DHAKF728NA', 'European Warehouse delivery', 'shipping', NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);


--
-- Data for Name: geo_zone; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCKHZV2D6MYM13FXZE1', 'country', 'gb', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCM6DA31P37KXK7YGHR', 'country', 'de', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCMFVRXNE6EJC7SW8RT', 'country', 'dk', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCM88T78GX4DD56YKCM', 'country', 'se', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCM92ZMBXKHSVTAW3DK', 'country', 'fr', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCMP1TWGT10M3QY6CJD', 'country', 'es', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);
INSERT INTO "public"."geo_zone" ("id", "type", "country_code", "province_code", "city", "service_zone_id", "postal_expression", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fgz_01M2AQBJCMBQJ9MEBZCVT7QT2Q', 'country', 'it', NULL, NULL, 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', NULL, NULL, '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: inventory_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS8RNXP01KDXD8WT68H', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.475+06', '2026-09-12 18:46:44.473+06', 'SHIRT-L-BLACK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'L / Black', 'L / Black', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS9E3AQEMH9KFPE4VGZ', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.492+06', '2026-09-12 18:46:44.473+06', 'SHIRT-L-WHITE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'L / White', 'L / White', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS89CVTKE4DSTZS77HG', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.499+06', '2026-09-12 18:46:44.473+06', 'SHIRT-M-BLACK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'M / Black', 'M / Black', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS8G0BDKDD6SESYXGSM', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.507+06', '2026-09-12 18:46:44.473+06', 'SHIRT-M-WHITE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'M / White', 'M / White', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS87EEXQ8BG92SQB8WN', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.514+06', '2026-09-12 18:46:44.473+06', 'SHIRT-S-BLACK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'S / Black', 'S / Black', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS822CJ7EX9ERBBA1BR', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.521+06', '2026-09-12 18:46:44.473+06', 'SHIRT-S-WHITE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'S / White', 'S / White', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS9729MPTAK7S2MEYJ9', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.527+06', '2026-09-12 18:46:44.473+06', 'SHIRT-XL-BLACK', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'XL / Black', 'XL / Black', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS921PJ6JEG1Q0HTH5X', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.533+06', '2026-09-12 18:46:44.473+06', 'SHIRT-XL-WHITE', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'XL / White', 'XL / White', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSA44SE4575HBKQ9DAJ', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.542+06', '2026-09-12 18:46:44.473+06', 'SHORTS-L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'L', 'L', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSAHYVC8WSWR4K00GTS', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.549+06', '2026-09-12 18:46:44.473+06', 'SHORTS-M', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'M', 'M', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSAETJ2NYTQ8EZ8AEXC', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.554+06', '2026-09-12 18:46:44.473+06', 'SHORTS-S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'S', 'S', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSA0APC29W5PMNS17PK', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.561+06', '2026-09-12 18:46:44.473+06', 'SHORTS-XL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'XL', 'XL', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSA1QXEN6WMTX2TEFZM', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.57+06', '2026-09-12 18:46:44.473+06', 'SWEATPANTS-L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'L', 'L', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSAYDE6CJD9N481QAJD', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.576+06', '2026-09-12 18:46:44.473+06', 'SWEATPANTS-M', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'M', 'M', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSASQJKM3VBVP8HF4K9', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.583+06', '2026-09-12 18:46:44.473+06', 'SWEATPANTS-S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'S', 'S', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJSAW4E15TXBZWSWQFFS', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.589+06', '2026-09-12 18:46:44.473+06', 'SWEATPANTS-XL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'XL', 'XL', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS99CVJP15S5JT99FNQ', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.595+06', '2026-09-12 18:46:44.473+06', 'SWEATSHIRT-L', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'L', 'L', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS9FFMA7TR7DHSC8RSW', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.601+06', '2026-09-12 18:46:44.473+06', 'SWEATSHIRT-M', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'M', 'M', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS9MWPYBK3ZGWSEF5TM', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.608+06', '2026-09-12 18:46:44.473+06', 'SWEATSHIRT-S', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'S', 'S', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2AQBJS9BXYX9R92CHT2V79R', '2026-09-12 17:52:00.043+06', '2026-09-12 18:46:44.614+06', '2026-09-12 18:46:44.473+06', 'SWEATSHIRT-XL', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'XL', 'XL', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWD7YNKJ269W0C8MBTP', '2026-09-12 18:47:01.519+06', '2026-09-15 19:53:05.237+06', '2026-09-15 19:53:05.235+06', 'PEN-RT-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Complete Starter Set', '10mg Complete Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWDZ58Y8A30SYJTG2MP', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.257+06', '2026-09-15 19:53:05.235+06', 'PEN-TR-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '15mg Complete Starter Set', '15mg Complete Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWDA9XQEB04NGK3BP6G', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.262+06', '2026-09-15 19:53:05.235+06', 'PEN-SM-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Complete Starter Set', '10mg Complete Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWD5D78NRAD6BCB529C', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.266+06', '2026-09-15 19:53:05.235+06', 'REF-RT-10', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Cartridge', '10mg Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWD7AWMA6NNCPAPXGHC', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.271+06', '2026-09-15 19:53:05.235+06', 'REF-TR-15', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '15mg Cartridge', '15mg Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWERZ26G7PZPA69VKG9', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.276+06', '2026-09-15 19:53:05.235+06', 'VIA-RT-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWEKP4EEGPK8FNC716K', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.282+06', '2026-09-15 19:53:05.235+06', 'VIA-RT-10MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Single Vial', '10mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWEFVPEJ3SRG6C1PZ6G', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.286+06', '2026-09-15 19:53:05.235+06', 'VIA-TR-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWE6BVX5NRT3ES9SVJM', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.292+06', '2026-09-15 19:53:05.235+06', 'VIA-TR-10MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Single Vial', '10mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWE5M1D60GYQHN73P0M', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.297+06', '2026-09-15 19:53:05.235+06', 'VIA-SM-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWE1C5WDKD89ERPDJXA', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.301+06', '2026-09-15 19:53:05.235+06', 'VIA-SM-10MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10mg Single Vial', '10mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWEB2DJZNCXAESG5XND', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.305+06', '2026-09-15 19:53:05.235+06', 'VIA-CU50-50MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '50mg Single Vial', '50mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWFNAXP121ZERD84ETH', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.309+06', '2026-09-15 19:53:05.235+06', 'VIA-CU100-100MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '100mg Single Vial', '100mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWFQN9X1Z6YEJ5CHJQG', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.313+06', '2026-09-15 19:53:05.235+06', 'VIA-BC5-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWFW81R4WVTPBBR5YK4', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.316+06', '2026-09-15 19:53:05.235+06', 'VIA-TB5-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWFXMRQ070W3XGTMK3B', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.319+06', '2026-09-15 19:53:05.235+06', 'VIA-NJ500-500MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '500mg Single Vial', '500mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2ATGAWF9QWWZCV49X7JP2ZQ', '2026-09-12 18:47:01.52+06', '2026-09-15 19:53:05.324+06', '2026-09-15 19:53:05.235+06', 'VIA-CGL5-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5mg Single Vial', '5mg Single Vial', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH0HKK8FFC5QAB0NFGG', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PPS-1000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Complete Starter Kit', 'Complete Starter Kit', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH0A8YQWFCBBEMYKBSC', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-RT40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'RT40 Starter Set', 'RT40 Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH0S9VE227KGRGCSDF2', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-CC1236', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'C.C-1236 Starter Set', 'C.C-1236 Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH0FXSDQQ4RGRE114CR', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-TBS30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'TB-S30 Starter Set', 'TB-S30 Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH065PZX6BEY2MAY8H3', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-IFC137', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'IFC-137 Starter Set', 'IFC-137 Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH0KADNB8KGW5WFQ2YQ', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-GVK0050', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'GVK-00 50 Starter Set', 'GVK-00 50 Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH1PW60ZGMB5CQEJX4T', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-PEN-MELATONIN2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Melatonin II Starter Set', 'Melatonin II Starter Set', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH1J7HVRTNBSHKF0RWS', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-RT40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH1AT70AAG0XM176R5D', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-CC1236', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH1ATQFCSA6V00T1XW2', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-TBS30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH15FKJRNG6S7STG4JV', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-IFC137', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH194WHRFMTCJ0DHKQ5', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-GVK0050', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH1BRNC7PD4HKDSQBD0', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-CRT-MELATONIN2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, 'Single Cartridge', 'Single Cartridge', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH2XTMRXMFJ2BGNWQQJ', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-VIA-5MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '5 mg', '5 mg', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH24SWFK7JAT0JQ6RH1', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-VIA-10MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '10 mg', '10 mg', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH27A5P8R644XSENJBJ', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-VIA-25MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '25 mg', '25 mg', NULL, NULL, NULL);
INSERT INTO "public"."inventory_item" ("id", "created_at", "updated_at", "deleted_at", "sku", "origin_country", "hs_code", "mid_code", "material", "weight", "length", "height", "width", "requires_shipping", "description", "title", "thumbnail", "metadata", "unit_of_measure") VALUES ('iitem_01M2JNFFH29TNSCSGD483Q6HY5', '2026-09-15 19:53:06.082+06', '2026-09-15 19:53:06.082+06', NULL, 'PEP-VIA-50MG', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, '50 mg', '50 mg', NULL, NULL, NULL);


--
-- Data for Name: inventory_level; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6THWQQDF7WEMH80D3F', '2026-09-12 17:52:00.476+06', '2026-09-12 18:46:44.491+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS8RNXP01KDXD8WT68H', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VRM8Q6G9HDW7QWFWR', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.499+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS9E3AQEMH9KFPE4VGZ', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TM7N6HTPN8XZYV7MW', '2026-09-12 17:52:00.476+06', '2026-09-12 18:46:44.507+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS89CVTKE4DSTZS77HG', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TM309C8SPKME2MNF2', '2026-09-12 17:52:00.476+06', '2026-09-12 18:46:44.513+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS8G0BDKDD6SESYXGSM', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TBRWE7YHJ5X1K3XVA', '2026-09-12 17:52:00.476+06', '2026-09-12 18:46:44.521+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS87EEXQ8BG92SQB8WN', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6SAR0ARJCHQ627NTHY', '2026-09-12 17:52:00.476+06', '2026-09-12 18:46:44.527+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS822CJ7EX9ERBBA1BR', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TABHMJ9V3NASPXJ02', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.533+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS9729MPTAK7S2MEYJ9', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TJBQMWK9YD5NA07K3', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.542+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS921PJ6JEG1Q0HTH5X', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VKP72MQFA4JTSV38W', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.548+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSA44SE4575HBKQ9DAJ', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VMBMXAF1QQBR770EN', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.554+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSAHYVC8WSWR4K00GTS', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VSGDN8HWMT3WTD7XF', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.56+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSAETJ2NYTQ8EZ8AEXC', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VTNEZX2XM37PW5W76', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.569+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSA0APC29W5PMNS17PK', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6V59DM0NHCX3JFPH4F', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.576+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSA1QXEN6WMTX2TEFZM', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6WJ9NX2ZEB9R3FJJCY', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.582+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSAYDE6CJD9N481QAJD', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6WKAW1PKSAJHYQGC75', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.589+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSASQJKM3VBVP8HF4K9', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6W8RHZP0P1FQ8M8NXT', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.595+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJSAW4E15TXBZWSWQFFS', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6TJKBQV6VFXAMVV9JZ', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.601+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS99CVJP15S5JT99FNQ', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VCHV9H1DJ1BXGPC0Q', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.607+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS9FFMA7TR7DHSC8RSW', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VCGFGCS5P6JXWEB5P', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.614+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS9MWPYBK3ZGWSEF5TM', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');
INSERT INTO "public"."inventory_level" ("id", "created_at", "updated_at", "deleted_at", "inventory_item_id", "location_id", "stocked_quantity", "reserved_quantity", "incoming_quantity", "metadata", "raw_stocked_quantity", "raw_reserved_quantity", "raw_incoming_quantity") VALUES ('ilev_01M2AQBK6VFT0JYS6QT7BDDZ4Y', '2026-09-12 17:52:00.477+06', '2026-09-12 18:46:44.62+06', '2026-09-12 18:46:44.473+06', 'iitem_01M2AQBJS9BXYX9R92CHT2V79R', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 1000000, 0, 0, NULL, '{"value": "1000000", "precision": 20}', '{"value": "0", "precision": 20}', '{"value": "0", "precision": 20}');


--
-- Data for Name: invite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: invite_rbac_role; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: layout_configuration; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: link_module_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (1, 'cart_payment_collection', '{"toModel": "payment_collection", "toModule": "payment", "fromModel": "cart", "fromModule": "cart"}', '2026-09-12 17:51:34.667761');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (2, 'cart_promotion', '{"toModel": "promotions", "toModule": "promotion", "fromModel": "cart", "fromModule": "cart"}', '2026-09-12 17:51:34.686371');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (3, 'customer_account_holder', '{"toModel": "account_holder", "toModule": "payment", "fromModel": "customer", "fromModule": "customer"}', '2026-09-12 17:51:34.696545');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (4, 'location_fulfillment_provider', '{"toModel": "fulfillment_provider", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}', '2026-09-12 17:51:34.706604');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (5, 'location_fulfillment_set', '{"toModel": "fulfillment_set", "toModule": "fulfillment", "fromModel": "location", "fromModule": "stock_location"}', '2026-09-12 17:51:34.719652');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (6, 'invite_rbac_role', '{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "invite", "fromModule": "user"}', '2026-09-12 17:51:34.728044');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (7, 'order_cart', '{"toModel": "cart", "toModule": "cart", "fromModel": "order", "fromModule": "order"}', '2026-09-12 17:51:34.739667');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (8, 'order_fulfillment', '{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "order", "fromModule": "order"}', '2026-09-12 17:51:34.751855');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (9, 'order_payment_collection', '{"toModel": "payment_collection", "toModule": "payment", "fromModel": "order", "fromModule": "order"}', '2026-09-12 17:51:34.761025');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (10, 'order_promotion', '{"toModel": "promotions", "toModule": "promotion", "fromModel": "order", "fromModule": "order"}', '2026-09-12 17:51:34.771082');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (11, 'return_fulfillment', '{"toModel": "fulfillments", "toModule": "fulfillment", "fromModel": "return", "fromModule": "order"}', '2026-09-12 17:51:34.782589');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (12, 'product_sales_channel', '{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "product", "fromModule": "product"}', '2026-09-12 17:51:34.792424');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (13, 'product_shipping_profile', '{"toModel": "shipping_profile", "toModule": "fulfillment", "fromModel": "product", "fromModule": "product"}', '2026-09-12 17:51:34.804069');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (14, 'product_variant_inventory_item', '{"toModel": "inventory", "toModule": "inventory", "fromModel": "variant", "fromModule": "product"}', '2026-09-12 17:51:34.814335');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (15, 'product_variant_price_set', '{"toModel": "price_set", "toModule": "pricing", "fromModel": "variant", "fromModule": "product"}', '2026-09-12 17:51:34.823674');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (16, 'publishable_api_key_sales_channel', '{"toModel": "sales_channel", "toModule": "sales_channel", "fromModel": "api_key", "fromModule": "api_key"}', '2026-09-12 17:51:34.834701');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (17, 'region_payment_provider', '{"toModel": "payment_provider", "toModule": "payment", "fromModel": "region", "fromModule": "region"}', '2026-09-12 17:51:34.846956');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (18, 'sales_channel_stock_location', '{"toModel": "location", "toModule": "stock_location", "fromModel": "sales_channel", "fromModule": "sales_channel"}', '2026-09-12 17:51:34.856641');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (19, 'shipping_option_price_set', '{"toModel": "price_set", "toModule": "pricing", "fromModel": "shipping_option", "fromModule": "fulfillment"}', '2026-09-12 17:51:34.86782');
INSERT INTO "public"."link_module_migrations" ("id", "table_name", "link_descriptor", "created_at") VALUES (20, 'user_rbac_role', '{"toModel": "rbac_role", "toModule": "rbac", "fromModel": "user", "fromModule": "user"}', '2026-09-12 17:51:34.87769');


--
-- Data for Name: location_fulfillment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."location_fulfillment_provider" ("stock_location_id", "fulfillment_provider_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 'manual_manual', 'locfp_01M2AQBJBX4PD5DHKX5TY8V4Y7', '2026-09-12 17:51:59.613597+06', '2026-09-12 17:51:59.613597+06', NULL);


--
-- Data for Name: location_fulfillment_set; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."location_fulfillment_set" ("stock_location_id", "fulfillment_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 'fuset_01M2AQBJCNM56GJ0DHAKF728NA', 'locfs_01M2AQBJDES4RXC89K8V7MWS5A', '2026-09-12 17:51:59.662694+06', '2026-09-12 17:51:59.662694+06', NULL);


--
-- Data for Name: mikro_orm_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (1, 'Migration20240307161216', '2026-09-12 17:51:22.551795+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (2, 'Migration20241210073813', '2026-09-12 17:51:22.551795+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (3, 'Migration20250106142624', '2026-09-12 17:51:22.551795+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (4, 'Migration20250120110820', '2026-09-12 17:51:22.551795+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (5, 'Migration20240307132720', '2026-09-12 17:51:22.900739+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (6, 'Migration20240719123015', '2026-09-12 17:51:22.900739+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (7, 'Migration20241213063611', '2026-09-12 17:51:22.900739+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (8, 'Migration20251010131115', '2026-09-12 17:51:22.900739+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (9, 'Migration20260815185216', '2026-09-12 17:51:22.900739+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (10, 'InitialSetup20240401153642', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (11, 'Migration20240601111544', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (12, 'Migration202408271511', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (13, 'Migration20241122120331', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (14, 'Migration20241125090957', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (15, 'Migration20250411073236', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (16, 'Migration20250516081326', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (17, 'Migration20250910154539', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (18, 'Migration20250911092221', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (19, 'Migration20250929204438', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (20, 'Migration20251008132218', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (21, 'Migration20251011090511', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (22, 'Migration20251022153442', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (23, 'Migration20251029150809', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (24, 'Migration20251110180907', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (25, 'Migration20251113183352', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (26, 'Migration20260224120000', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (27, 'Migration20260301002050', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (28, 'Migration20260306120000', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (29, 'Migration20260623180000', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (30, 'Migration20260730104846', '2026-09-12 17:51:23.343912+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (31, 'Migration20230929122253', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (32, 'Migration20240322094407', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (33, 'Migration20240322113359', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (34, 'Migration20240322120125', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (35, 'Migration20240626133555', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (36, 'Migration20240704094505', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (37, 'Migration20241127114534', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (38, 'Migration20241127223829', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (39, 'Migration20241128055359', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (40, 'Migration20241212190401', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (41, 'Migration20250408145122', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (42, 'Migration20250409122219', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (43, 'Migration20251009110625', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (44, 'Migration20251112192723', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (45, 'Migration20260429163502', '2026-09-12 17:51:24.68089+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (46, 'Migration20240227120221', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (47, 'Migration20240617102917', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (48, 'Migration20240624153824', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (49, 'Migration20241211061114', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (50, 'Migration20250113094144', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (51, 'Migration20250120110700', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (52, 'Migration20250226130616', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (53, 'Migration20250508081510', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (54, 'Migration20250828075407', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (55, 'Migration20250909083125', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (56, 'Migration20250916120552', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (57, 'Migration20250917143818', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (58, 'Migration20250919122137', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (59, 'Migration20251006000000', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (60, 'Migration20251015113934', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (61, 'Migration20251107050148', '2026-09-12 17:51:25.526309+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (62, 'Migration20240124154000', '2026-09-12 17:51:26.310985+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (63, 'Migration20240524123112', '2026-09-12 17:51:26.310985+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (64, 'Migration20240602110946', '2026-09-12 17:51:26.310985+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (65, 'Migration20241211074630', '2026-09-12 17:51:26.310985+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (66, 'Migration20251010130829', '2026-09-12 17:51:26.310985+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (67, 'Migration20240115152146', '2026-09-12 17:51:26.698577+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (68, 'Migration20240222170223', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (69, 'Migration20240831125857', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (70, 'Migration20241106085918', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (71, 'Migration20241205095237', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (72, 'Migration20241216183049', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (73, 'Migration20241218091938', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (74, 'Migration20250120115059', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (75, 'Migration20250212131240', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (76, 'Migration20250326151602', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (77, 'Migration20250508081553', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (78, 'Migration20251017153909', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (79, 'Migration20251208130704', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (80, 'Migration20260626000000', '2026-09-12 17:51:26.861015+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (81, 'Migration20240205173216', '2026-09-12 17:51:27.449575+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (82, 'Migration20240624200006', '2026-09-12 17:51:27.449575+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (83, 'Migration20250120110744', '2026-09-12 17:51:27.449575+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (84, 'InitialSetup20240221144943', '2026-09-12 17:51:27.727906+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (85, 'Migration20240604080145', '2026-09-12 17:51:27.727906+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (86, 'Migration20241205122700', '2026-09-12 17:51:27.727906+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (87, 'Migration20251015123842', '2026-09-12 17:51:27.727906+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (88, 'InitialSetup20240227075933', '2026-09-12 17:51:27.947391+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (89, 'Migration20240621145944', '2026-09-12 17:51:27.947391+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (90, 'Migration20241206083313', '2026-09-12 17:51:27.947391+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (91, 'Migration20251202184737', '2026-09-12 17:51:27.947391+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (92, 'Migration20251212161429', '2026-09-12 17:51:27.947391+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (93, 'Migration20240227090331', '2026-09-12 17:51:28.226325+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (94, 'Migration20240710135844', '2026-09-12 17:51:28.226325+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (95, 'Migration20240924114005', '2026-09-12 17:51:28.226325+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (96, 'Migration20241212052837', '2026-09-12 17:51:28.226325+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (97, 'InitialSetup20240228133303', '2026-09-12 17:51:28.508557+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (98, 'Migration20240624082354', '2026-09-12 17:51:28.508557+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (99, 'Migration20240225134525', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (100, 'Migration20240806072619', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (101, 'Migration20241211151053', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (102, 'Migration20250115160517', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (103, 'Migration20250120110552', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (104, 'Migration20250123122334', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (105, 'Migration20250206105639', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (106, 'Migration20250207132723', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (107, 'Migration20250625084134', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (108, 'Migration20250924135437', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (109, 'Migration20250929124701', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (110, 'Migration20260411223700', '2026-09-12 17:51:28.678234+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (111, 'Migration20240219102530', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (112, 'Migration20240604100512', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (113, 'Migration20240715102100', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (114, 'Migration20240715174100', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (115, 'Migration20240716081800', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (116, 'Migration20240801085921', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (117, 'Migration20240821164505', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (118, 'Migration20240821170920', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (119, 'Migration20240827133639', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (120, 'Migration20240902195921', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (121, 'Migration20240913092514', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (122, 'Migration20240930122627', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (123, 'Migration20241014142943', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (124, 'Migration20241106085223', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (125, 'Migration20241129124827', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (126, 'Migration20241217162224', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (127, 'Migration20250326151554', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (128, 'Migration20250522181137', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (129, 'Migration20250702095353', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (130, 'Migration20250704120229', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (131, 'Migration20250910130000', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (132, 'Migration20251016160403', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (133, 'Migration20251016182939', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (134, 'Migration20251017155709', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (135, 'Migration20251114100559', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (136, 'Migration20251125164002', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (137, 'Migration20251210112909', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (138, 'Migration20251210112924', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (139, 'Migration20251225120947', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (140, 'Migration20260106185528', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (141, 'Migration20260625000000', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (142, 'Migration20260729154253', '2026-09-12 17:51:29.19589+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (143, 'Migration20250717162007', '2026-09-12 17:51:30.421759+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (144, 'Migration20260127081758', '2026-09-12 17:51:30.421759+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (145, 'Migration20260615151246', '2026-09-12 17:51:30.421759+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (146, 'Migration20240205025928', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (147, 'Migration20240529080336', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (148, 'Migration20241202100304', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (149, 'Migration20260514083900', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (150, 'Migration20260525090000', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (151, 'Migration20260604120000', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (152, 'Migration20260616075929', '2026-09-12 17:51:30.677204+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (153, 'Migration20240214033943', '2026-09-12 17:51:31.33385+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (154, 'Migration20240703095850', '2026-09-12 17:51:31.33385+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (155, 'Migration20241202103352', '2026-09-12 17:51:31.33385+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (156, 'Migration20240311145700_InitialSetupMigration', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (157, 'Migration20240821170957', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (158, 'Migration20240917161003', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (159, 'Migration20241217110416', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (160, 'Migration20250113122235', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (161, 'Migration20250120115002', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (162, 'Migration20250822130931', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (163, 'Migration20250825132614', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (164, 'Migration20251114133146', '2026-09-12 17:51:31.546799+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (165, 'Migration20240509083918_InitialSetupMigration', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (166, 'Migration20240628075401', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (167, 'Migration20240830094712', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (168, 'Migration20250120110514', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (169, 'Migration20251028172715', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (170, 'Migration20251121123942', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (171, 'Migration20251121150408', '2026-09-12 17:51:32.367657+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (172, 'Migration20260805085626', '2026-09-12 17:51:32.785104+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (173, 'Migration20260903085616', '2026-09-12 17:51:32.785104+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (174, 'Migration20260807120000', '2026-09-12 17:51:33.064542+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (175, 'Migration20231228143900', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (176, 'Migration20241206101446', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (177, 'Migration20250128174331', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (178, 'Migration20250505092459', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (179, 'Migration20250819104213', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (180, 'Migration20250819110924', '2026-09-12 17:51:33.566148+06');
INSERT INTO "public"."mikro_orm_migrations" ("id", "name", "executed_at") VALUES (181, 'Migration20250908080305', '2026-09-12 17:51:33.566148+06');


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: notification_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."notification_provider" ("id", "handle", "name", "is_enabled", "channels", "created_at", "updated_at", "deleted_at") VALUES ('local', 'local', 'local', true, '{feed}', '2026-09-12 17:51:39.949+06', '2026-09-12 17:51:39.949+06', NULL);


--
-- Data for Name: order; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6CWSCBQJMHR1KYJ6F41D', NULL, 2, NULL, 1, NULL, 'completed', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6CWESTYVJGA331XF9KXA', 'ordaddr_01M2NK6CWEQ37J7QR07BDN3F6A', NULL, '{"tags": ["Walmart"], "notes": "Order# 697930605097\nShipping info: $1.96, Delivery by April 5, 2017, 1:28 pm EDT", "source": "GeekSeller Integration", "fulfillments": [{"id": "1018-F3", "status": "fulfilled", "carrier": "FedEx", "shipped_at": "2026-09-16T12:10:54.604Z", "tracking_url": "https://www.fedex.com/fedextrack/?trknbr=0987654321", "tracking_number": "0987654321"}], "payment_status": "paid", "fulfillment_status": "fulfilled"}', '2026-09-16 23:10:54.623+06', '2026-09-16 23:10:54.623+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D1GKR8D2YK7B6FW8MMK', NULL, 3, NULL, 1, NULL, 'pending', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D1D1QD8H2MWAGZE5MD3', 'ordaddr_01M2NK6D1DT8PXEW2A0D1BE83C', NULL, '{"tags": ["Repeat Customer"], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D2SYT7R2A97S0K4H24Q', NULL, 4, NULL, 1, NULL, 'pending', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D2RB13K6N6RN0R1NAYC', 'ordaddr_01M2NK6D2RGRDD58ATRDV8CXDA', NULL, '{"tags": ["RUO Research"], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.811+06', '2026-09-16 23:10:54.811+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D3RVSN0VWWM5RV9QKXG', NULL, 5, NULL, 1, NULL, 'completed', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D3QCAMW3E1ZFY1ZD832', 'ordaddr_01M2NK6D3QCMP6DXWG8FC9RAND', NULL, '{"tags": ["Walmart", "Priority"], "source": "GeekSeller Integration", "fulfillments": [{"id": "1015-F1", "status": "fulfilled", "carrier": "Royal Mail Tracked", "shipped_at": "2026-09-15T17:10:54.604Z", "tracking_url": "https://www.royalmail.com/track-your-item#/tracking-results/RM987654321GB", "tracking_number": "RM987654321GB"}], "payment_status": "paid", "fulfillment_status": "fulfilled"}', '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D4SG0HXVYB1T9BE7XMK', NULL, 6, NULL, 1, NULL, 'pending', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D4QF60W6N2CS62VQM4F', 'ordaddr_01M2NK6D4QB2NYTEZ0N2NR1DMD', NULL, '{"tags": ["Laboratory"], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D5YCYM72JKQNAGDCGB3', NULL, 7, NULL, 1, NULL, 'pending', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D5XD8QCZAMC67NVHA1X', 'ordaddr_01M2NK6D5X5S5SHRBFKNTFJVD8', NULL, '{"tags": [], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D6Z7R1HDJ1EWEF8DQPH', NULL, 8, NULL, 1, NULL, 'pending', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D6YDS4E7G0GAJGWT3W3', 'ordaddr_01M2NK6D6XXH9DE6HQKP6RJDHP', NULL, '{"tags": ["Wholesale"], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D7X4YC43R7D8VX7NEDQ', NULL, 9, NULL, 1, NULL, 'pending', false, 'maggie.simpson@springfield.org', 'usd', 'ordaddr_01M2NK6D7WFBV7V5BX2B62FEP6', 'ordaddr_01M2NK6D7W595RMNBMK5CGXT0B', NULL, '{"tags": ["VIP"], "source": "Online Store", "fulfillments": [], "payment_status": "paid", "fulfillment_status": "unfulfilled"}', '2026-09-16 23:10:54.974+06', '2026-09-16 23:10:54.974+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK6D8VBP11GN0R4FZZFCAF', NULL, 10, NULL, 1, NULL, 'completed', false, 'santa.helper@peptech.bio', 'usd', 'ordaddr_01M2NK6D8SSK7V4SYYVSEFR7AV', 'ordaddr_01M2NK6D8SF91H12XKBSD4XCSV', NULL, '{"tags": ["Walmart"], "source": "GeekSeller Integration", "fulfillments": [{"id": "1010-F1", "status": "fulfilled", "carrier": "FedEx", "shipped_at": "2026-09-13T17:10:54.604Z", "tracking_url": "https://www.fedex.com/fedextrack/?trknbr=0491823719", "tracking_number": "0491823719"}], "payment_status": "paid", "fulfillment_status": "fulfilled"}', '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order" ("id", "region_id", "display_id", "customer_id", "version", "sales_channel_id", "status", "is_draft_order", "email", "currency_code", "shipping_address_id", "billing_address_id", "no_notification", "metadata", "created_at", "updated_at", "deleted_at", "canceled_at", "custom_display_id", "locale") VALUES ('order_01M2NK1JNTKN203BX4V45ZK52V', NULL, 1, NULL, 1, NULL, 'pending', false, 'santa@example.com', 'usd', NULL, NULL, NULL, '{"tags": ["Walmart", "Verified RUO", "Tested"], "fulfillments": [{"id": "1-F1", "status": "fulfilled", "carrier": "FedEx", "shipped_at": "2026-09-18T14:12:20.429Z", "tracking_url": "https://www.fedex.com/fedextrack/?trknbr=0987654321", "tracking_number": "0987654321"}], "fulfillment_status": "fulfilled"}', '2026-09-16 23:08:16.703+06', '2026-09-18 20:12:20.491+06', NULL, NULL, NULL, NULL);


--
-- Data for Name: order_address; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6CWEQ37J7QR07BDN3F6A', NULL, 'Evergreen Pet Supplies', 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.622+06', '2026-09-16 23:10:54.622+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6CWESTYVJGA331XF9KXA', NULL, 'Evergreen Pet Supplies', 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.623+06', '2026-09-16 23:10:54.623+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D1DT8PXEW2A0D1BE83C', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D1D1QD8H2MWAGZE5MD3', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D2RGRDD58ATRDV8CXDA', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.81+06', '2026-09-16 23:10:54.81+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D2RB13K6N6RN0R1NAYC', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.811+06', '2026-09-16 23:10:54.811+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D3QCMP6DXWG8FC9RAND', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D3QCAMW3E1ZFY1ZD832', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D4QB2NYTEZ0N2NR1DMD', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D4QF60W6N2CS62VQM4F', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D5X5S5SHRBFKNTFJVD8', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D5XD8QCZAMC67NVHA1X', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D6XXH9DE6HQKP6RJDHP', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D6YDS4E7G0GAJGWT3W3', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D7W595RMNBMK5CGXT0B', NULL, NULL, 'Maggie', 'Simpson', '742 Evergreen Terrace', NULL, 'Springfield', 'us', 'OR', '97477', '555-0199', NULL, '2026-09-16 23:10:54.974+06', '2026-09-16 23:10:54.974+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D7WFBV7V5BX2B62FEP6', NULL, NULL, 'Maggie', 'Simpson', '742 Evergreen Terrace', NULL, 'Springfield', 'us', 'OR', '97477', '555-0199', NULL, '2026-09-16 23:10:54.974+06', '2026-09-16 23:10:54.974+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D8SF91H12XKBSD4XCSV', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL);
INSERT INTO "public"."order_address" ("id", "customer_id", "company", "first_name", "last_name", "address_1", "address_2", "city", "country_code", "province", "postal_code", "phone", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ordaddr_01M2NK6D8SSK7V4SYYVSEFR7AV', NULL, NULL, 'Santa''s', 'Little Helper', '34 Birch street', NULL, 'Old Cairo', 'us', 'MS', '38829', '212-212-9828', NULL, '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL);


--
-- Data for Name: order_cart; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_change; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_change" ("id", "order_id", "version", "description", "status", "internal_note", "created_by", "requested_by", "requested_at", "confirmed_by", "confirmed_at", "declined_by", "declined_reason", "metadata", "declined_at", "canceled_by", "canceled_at", "created_at", "updated_at", "change_type", "deleted_at", "return_id", "claim_id", "exchange_id", "carry_over_promotions", "no_notification") VALUES ('ordch_01M2NM74KXFTG3N089W42GD1VB', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, NULL, 'confirmed', NULL, 'user_01M2AQBY1MKD7BCMDJRVBBMKJ8', NULL, NULL, 'user_01M2AQBY1MKD7BCMDJRVBBMKJ8', '2026-09-16 23:28:47.482+06', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-16 23:28:47.485+06', '2026-09-16 23:28:47.485+06', 'update_order', NULL, NULL, NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_change" ("id", "order_id", "version", "description", "status", "internal_note", "created_by", "requested_by", "requested_at", "confirmed_by", "confirmed_at", "declined_by", "declined_reason", "metadata", "declined_at", "canceled_by", "canceled_at", "created_at", "updated_at", "change_type", "deleted_at", "return_id", "claim_id", "exchange_id", "carry_over_promotions", "no_notification") VALUES ('ordch_01M2TDRVX5AFTYEK49VV0E3VK7', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, NULL, 'confirmed', NULL, 'user_01M2AQBY1MKD7BCMDJRVBBMKJ8', NULL, NULL, 'user_01M2AQBY1MKD7BCMDJRVBBMKJ8', '2026-09-18 20:12:20.514+06', NULL, NULL, NULL, NULL, NULL, NULL, '2026-09-18 20:12:20.517+06', '2026-09-18 20:12:20.517+06', 'update_order', NULL, NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: order_change_action; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_change_action" ("id", "order_id", "version", "ordering", "order_change_id", "reference", "reference_id", "action", "details", "amount", "raw_amount", "internal_note", "applied", "created_at", "updated_at", "deleted_at", "return_id", "claim_id", "exchange_id") VALUES ('ordchact_01M2NM74KWDB5H2H4BVV2FSY37', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, 1, 'ordch_01M2NM74KXFTG3N089W42GD1VB', NULL, NULL, 'UPDATE_ORDER_PROPERTIES', '{"new": {"tags": ["Walmart", "Verified RUO", "Tested"]}, "old": null, "type": "metadata"}', NULL, NULL, NULL, true, '2026-09-16 23:28:47.485+06', '2026-09-16 23:28:47.485+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_change_action" ("id", "order_id", "version", "ordering", "order_change_id", "reference", "reference_id", "action", "details", "amount", "raw_amount", "internal_note", "applied", "created_at", "updated_at", "deleted_at", "return_id", "claim_id", "exchange_id") VALUES ('ordchact_01M2TDRVX45ZB4YWJA8J2G63M3', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, 2, 'ordch_01M2TDRVX5AFTYEK49VV0E3VK7', NULL, NULL, 'UPDATE_ORDER_PROPERTIES', '{"new": {"tags": ["Walmart", "Verified RUO", "Tested"], "fulfillments": [{"id": "1-F1", "status": "fulfilled", "carrier": "FedEx", "shipped_at": "2026-09-18T14:12:20.429Z", "tracking_url": "https://www.fedex.com/fedextrack/?trknbr=0987654321", "tracking_number": "0987654321"}], "fulfillment_status": "fulfilled"}, "old": {"tags": ["Walmart", "Verified RUO", "Tested"]}, "type": "metadata"}', NULL, NULL, NULL, true, '2026-09-18 20:12:20.518+06', '2026-09-18 20:12:20.518+06', NULL, NULL, NULL, NULL);


--
-- Data for Name: order_claim; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_claim_item; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_claim_item_image; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_credit_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_exchange; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_exchange_item; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK1JNX0ZV8PH53PCP2D3PN', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, 'ordli_01M2NK1JNWD9BSM2CJSK9RZBCZ', 2, '{"value": "2", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:08:16.703+06', '2026-09-16 23:08:16.703+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6CWXR0N7QHK0YHJ4RR4T', 'order_01M2NK6CWSCBQJMHR1KYJ6F41D', 1, 'ordli_01M2NK6CWVYKQNZ0YXKJEM5FTW', 2, '{"value": "2", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.623+06', '2026-09-16 23:10:54.623+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6CWXNHGD487CN9BWRKM4', 'order_01M2NK6CWSCBQJMHR1KYJ6F41D', 1, 'ordli_01M2NK6CWVRW2QGAV3TGHGXE24', 2, '{"value": "2", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.624+06', '2026-09-16 23:10:54.624+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D1HATHQTQGEWZVK238S', 'order_01M2NK6D1GKR8D2YK7B6FW8MMK', 1, 'ordli_01M2NK6D1GEP88S8WN8DP48JWF', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D2TSY3BTMAE8MFV0JQH', 'order_01M2NK6D2SYT7R2A97S0K4H24Q', 1, 'ordli_01M2NK6D2TMTCFRW68Q2KEXG2V', 2, '{"value": "2", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.811+06', '2026-09-16 23:10:54.811+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D3S42NH8TWBZ4G01X7A', 'order_01M2NK6D3RVSN0VWWM5RV9QKXG', 1, 'ordli_01M2NK6D3S1WDEMB48GDG03ZQ7', 3, '{"value": "3", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D4SF5D5P8VY2PKCP84C', 'order_01M2NK6D4SG0HXVYB1T9BE7XMK', 1, 'ordli_01M2NK6D4S1JPH5T5NE2Z5A2M6', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D5ZVZ446DM5W1V34X1N', 'order_01M2NK6D5YCYM72JKQNAGDCGB3', 1, 'ordli_01M2NK6D5ZE5J5KH36M1G45P9P', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D6ZQMGZJJRRAWVCF5PK', 'order_01M2NK6D6Z7R1HDJ1EWEF8DQPH', 1, 'ordli_01M2NK6D6ZEJAWSQBBF6J3PN8R', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D7Y7M75PHD1E99WTN05', 'order_01M2NK6D7X4YC43R7D8VX7NEDQ', 1, 'ordli_01M2NK6D7Y691JK6Y2A6AAGGF9', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:54.974+06', '2026-09-16 23:10:54.974+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_item" ("id", "order_id", "version", "item_id", "quantity", "raw_quantity", "fulfilled_quantity", "raw_fulfilled_quantity", "shipped_quantity", "raw_shipped_quantity", "return_requested_quantity", "raw_return_requested_quantity", "return_received_quantity", "raw_return_received_quantity", "return_dismissed_quantity", "raw_return_dismissed_quantity", "written_off_quantity", "raw_written_off_quantity", "metadata", "created_at", "updated_at", "deleted_at", "delivered_quantity", "raw_delivered_quantity", "unit_price", "raw_unit_price", "compare_at_unit_price", "raw_compare_at_unit_price") VALUES ('orditem_01M2NK6D8WBQNEG0TNT5PNVQ8T', 'order_01M2NK6D8VBP11GN0R4FZZFCAF', 1, 'ordli_01M2NK6D8V1C9ZFFQ91EKVJTR5', 1, '{"value": "1", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', 0, '{"value": "0", "precision": 20}', NULL, '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL, 0, '{"value": "0", "precision": 20}', NULL, NULL, NULL, NULL);


--
-- Data for Name: order_line_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK1JNWD9BSM2CJSK9RZBCZ', NULL, 'Test Product 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, true, false, NULL, NULL, 12.45, '{"value": "12.45", "precision": 20}', NULL, '2026-09-16 23:08:16.703+06', '2026-09-16 23:08:16.703+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6CWVYKQNZ0YXKJEM5FTW', NULL, 'Test Product 2', NULL, 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'test2', NULL, NULL, NULL, true, true, false, NULL, NULL, 12.45, '{"value": "12.45", "precision": 20}', NULL, '2026-09-16 23:10:54.623+06', '2026-09-16 23:10:54.623+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6CWVRW2QGAV3TGHGXE24', NULL, 'Test product', NULL, 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'test1', NULL, NULL, NULL, true, true, false, NULL, NULL, 12, '{"value": "12", "precision": 20}', NULL, '2026-09-16 23:10:54.623+06', '2026-09-16 23:10:54.623+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D1GEP88S8WN8DP48JWF', NULL, 'Complete Pen Set - Midnight Navy', NULL, '/images/peptech/mockup1.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PEN-SET-NVY', NULL, NULL, NULL, true, true, false, NULL, NULL, 249, '{"value": "249", "precision": 20}', NULL, '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D2TMTCFRW68Q2KEXG2V', NULL, 'GHK-Cu Refill Cartridge 50mg', NULL, '/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REF-GHK-50', NULL, NULL, NULL, true, true, false, NULL, NULL, 39, '{"value": "39", "precision": 20}', NULL, '2026-09-16 23:10:54.811+06', '2026-09-16 23:10:54.811+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D3S1WDEMB48GDG03ZQ7', NULL, 'BPC-157 Refill Cartridge 10mg', NULL, '/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REF-BPC-10', NULL, NULL, NULL, true, true, false, NULL, NULL, 35, '{"value": "35", "precision": 20}', NULL, '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D4S1JPH5T5NE2Z5A2M6', NULL, 'Semaglutide Lyophilised Vial 5mg', NULL, '/images/peptech/mockup2.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'VIAL-SEMA-5', NULL, NULL, NULL, true, true, false, NULL, NULL, 120, '{"value": "120", "precision": 20}', NULL, '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D5ZE5J5KH36M1G45P9P', NULL, 'TB-500 Refill Cartridge 10mg', NULL, '/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REF-TB-10', NULL, NULL, NULL, true, true, false, NULL, NULL, 33, '{"value": "33", "precision": 20}', NULL, '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D6ZEJAWSQBBF6J3PN8R', NULL, 'NAD+ Refill Cartridge 500mg', NULL, '/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'REF-NAD-500', NULL, NULL, NULL, true, true, false, NULL, NULL, 25, '{"value": "25", "precision": 20}', NULL, '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D7Y691JK6Y2A6AAGGF9', NULL, 'Complete Pen Set - Glacier Silver', NULL, '/images/peptech/mockup1.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'PEN-SET-SLV', NULL, NULL, NULL, true, true, false, NULL, NULL, 249, '{"value": "249", "precision": 20}', NULL, '2026-09-16 23:10:54.974+06', '2026-09-16 23:10:54.974+06', NULL, false, NULL, false);
INSERT INTO "public"."order_line_item" ("id", "totals_id", "title", "subtitle", "thumbnail", "variant_id", "product_id", "product_title", "product_description", "product_subtitle", "product_type", "product_collection", "product_handle", "variant_sku", "variant_barcode", "variant_title", "variant_option_values", "requires_shipping", "is_discountable", "is_tax_inclusive", "compare_at_unit_price", "raw_compare_at_unit_price", "unit_price", "raw_unit_price", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_price", "product_type_id", "is_giftcard") VALUES ('ordli_01M2NK6D8V1C9ZFFQ91EKVJTR5', NULL, 'Tirzepatide Lyophilised Vial 10mg', NULL, '/images/peptech/mockup2.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'VIAL-TIRZ-10', NULL, NULL, NULL, true, true, false, NULL, NULL, 160, '{"value": "160", "precision": 20}', NULL, '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL, false, NULL, false);


--
-- Data for Name: order_line_item_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_line_item_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_promotion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_shipping; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_shipping" ("id", "order_id", "version", "shipping_method_id", "created_at", "updated_at", "deleted_at", "return_id", "claim_id", "exchange_id") VALUES ('ordspmv_01M2NK6CWRBG0NJ4JSEJA5Z1YK', 'order_01M2NK6CWSCBQJMHR1KYJ6F41D', 1, 'ordsm_01M2NK6CWRXCTP4RE6E63ANWAR', '2026-09-16 23:10:54.624+06', '2026-09-16 23:10:54.624+06', NULL, NULL, NULL, NULL);
INSERT INTO "public"."order_shipping" ("id", "order_id", "version", "shipping_method_id", "created_at", "updated_at", "deleted_at", "return_id", "claim_id", "exchange_id") VALUES ('ordspmv_01M2NK6D1G3RJYRSH0S2R1GNW1', 'order_01M2NK6D1GKR8D2YK7B6FW8MMK', 1, 'ordsm_01M2NK6D1G4W13CXAJ3Z22BA82', '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL, NULL, NULL, NULL);


--
-- Data for Name: order_shipping_method; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_shipping_method" ("id", "name", "description", "amount", "raw_amount", "is_tax_inclusive", "shipping_option_id", "data", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_amount") VALUES ('ordsm_01M2NK6CWRXCTP4RE6E63ANWAR', 'Standard Shipping (4.01%)', NULL, 1.96, '{"value": "1.96", "precision": 20}', false, NULL, NULL, NULL, '2026-09-16 23:10:54.624+06', '2026-09-16 23:10:54.624+06', NULL, false);
INSERT INTO "public"."order_shipping_method" ("id", "name", "description", "amount", "raw_amount", "is_tax_inclusive", "shipping_option_id", "data", "metadata", "created_at", "updated_at", "deleted_at", "is_custom_amount") VALUES ('ordsm_01M2NK6D1G4W13CXAJ3Z22BA82', 'Royal Mail Tracked', NULL, 4.95, '{"value": "4.95", "precision": 20}', false, NULL, NULL, NULL, '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL, false);


--
-- Data for Name: order_shipping_method_adjustment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_shipping_method_tax_line; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: order_summary; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK1JNSS41V506WJY3FBZCS', 'order_01M2NK1JNTKN203BX4V45ZK52V', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 24.9, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 24.9, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 24.9, "original_order_total": 24.9, "raw_accounting_total": {"value": "24.9", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "24.9", "precision": 20}, "raw_current_order_total": {"value": "24.9", "precision": 20}, "raw_original_order_total": {"value": "24.9", "precision": 20}}', '2026-09-16 23:08:16.704+06', '2026-09-16 23:08:16.704+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6CWNTJZX3J9W27MJNDQW', 'order_01M2NK6CWSCBQJMHR1KYJ6F41D', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 50.86, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 50.86, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 50.86, "original_order_total": 50.86, "raw_accounting_total": {"value": "50.86", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "50.86", "precision": 20}, "raw_current_order_total": {"value": "50.86", "precision": 20}, "raw_original_order_total": {"value": "50.86", "precision": 20}}', '2026-09-16 23:10:54.624+06', '2026-09-16 23:10:54.624+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D1F35NGGD82F61ZMKVP', 'order_01M2NK6D1GKR8D2YK7B6FW8MMK', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 253.95, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 253.95, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 253.95, "original_order_total": 253.95, "raw_accounting_total": {"value": "253.95", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "253.95", "precision": 20}, "raw_current_order_total": {"value": "253.95", "precision": 20}, "raw_original_order_total": {"value": "253.95", "precision": 20}}', '2026-09-16 23:10:54.77+06', '2026-09-16 23:10:54.77+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D2SE3P6BVMBB33HH1RZ', 'order_01M2NK6D2SYT7R2A97S0K4H24Q', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 78, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 78, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 78, "original_order_total": 78, "raw_accounting_total": {"value": "78", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "78", "precision": 20}, "raw_current_order_total": {"value": "78", "precision": 20}, "raw_original_order_total": {"value": "78", "precision": 20}}', '2026-09-16 23:10:54.811+06', '2026-09-16 23:10:54.811+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D3RSRHFMM7DNJMXD40A', 'order_01M2NK6D3RVSN0VWWM5RV9QKXG', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 105, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 105, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 105, "original_order_total": 105, "raw_accounting_total": {"value": "105", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "105", "precision": 20}, "raw_current_order_total": {"value": "105", "precision": 20}, "raw_original_order_total": {"value": "105", "precision": 20}}', '2026-09-16 23:10:54.841+06', '2026-09-16 23:10:54.841+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D4SGXP4JRSFEE8ZM0K8', 'order_01M2NK6D4SG0HXVYB1T9BE7XMK', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 120, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 120, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 120, "original_order_total": 120, "raw_accounting_total": {"value": "120", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "120", "precision": 20}, "raw_current_order_total": {"value": "120", "precision": 20}, "raw_original_order_total": {"value": "120", "precision": 20}}', '2026-09-16 23:10:54.874+06', '2026-09-16 23:10:54.874+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D5YP5HENQRGWPZMJNHV', 'order_01M2NK6D5YCYM72JKQNAGDCGB3', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 33, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 33, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 33, "original_order_total": 33, "raw_accounting_total": {"value": "33", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "33", "precision": 20}, "raw_current_order_total": {"value": "33", "precision": 20}, "raw_original_order_total": {"value": "33", "precision": 20}}', '2026-09-16 23:10:54.912+06', '2026-09-16 23:10:54.912+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D6Z7YYHE5GQA9MVQPX4', 'order_01M2NK6D6Z7R1HDJ1EWEF8DQPH', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 25, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 25, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 25, "original_order_total": 25, "raw_accounting_total": {"value": "25", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "25", "precision": 20}, "raw_current_order_total": {"value": "25", "precision": 20}, "raw_original_order_total": {"value": "25", "precision": 20}}', '2026-09-16 23:10:54.944+06', '2026-09-16 23:10:54.944+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D7X44R7KZRRJHWA665N', 'order_01M2NK6D7X4YC43R7D8VX7NEDQ', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 249, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 249, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 249, "original_order_total": 249, "raw_accounting_total": {"value": "249", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "249", "precision": 20}, "raw_current_order_total": {"value": "249", "precision": 20}, "raw_original_order_total": {"value": "249", "precision": 20}}', '2026-09-16 23:10:54.975+06', '2026-09-16 23:10:54.975+06', NULL);
INSERT INTO "public"."order_summary" ("id", "order_id", "version", "totals", "created_at", "updated_at", "deleted_at") VALUES ('ordsum_01M2NK6D8TRAGE6SRDB4M994GQ', 'order_01M2NK6D8VBP11GN0R4FZZFCAF', 1, '{"paid_total": 0, "raw_paid_total": {"value": "0", "precision": 20}, "refunded_total": 0, "accounting_total": 160, "credit_line_total": 0, "transaction_total": 0, "pending_difference": 160, "raw_refunded_total": {"value": "0", "precision": 20}, "current_order_total": 160, "original_order_total": 160, "raw_accounting_total": {"value": "160", "precision": 20}, "raw_credit_line_total": {"value": "0", "precision": 20}, "raw_transaction_total": {"value": "0", "precision": 20}, "raw_pending_difference": {"value": "160", "precision": 20}, "raw_current_order_total": {"value": "160", "precision": 20}, "raw_original_order_total": {"value": "160", "precision": 20}}', '2026-09-16 23:10:55.004+06', '2026-09-16 23:10:55.004+06', NULL);


--
-- Data for Name: order_transaction; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_collection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_collection_payment_providers; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: payment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."payment_provider" ("id", "is_enabled", "created_at", "updated_at", "deleted_at") VALUES ('pp_system_default', true, '2026-09-12 17:51:39.946+06', '2026-09-12 17:51:39.946+06', NULL);


--
-- Data for Name: payment_session; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFWZX4E6J71CVGRYNJN', NULL, 'pset_01M2AQBJFXNGW6V9K3GTXFPK8S', 'usd', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFXEKZ20AK5KEE40ZJA', NULL, 'pset_01M2AQBJFXNGW6V9K3GTXFPK8S', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFX6PZNAERZG334HMKG', NULL, 'pset_01M2AQBJFXNGW6V9K3GTXFPK8S', 'eur', '{"value": "10", "precision": 20}', 1, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFYNBNZ89CT7CGJRSV2', NULL, 'pset_01M2AQBJFYYF92V5M5YBCQGR8W', 'usd', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFYBACXP89J3T16WJXC', NULL, 'pset_01M2AQBJFYYF92V5M5YBCQGR8W', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBJFY8MFRPS0P91ZV9SRB', NULL, 'pset_01M2AQBJFYYF92V5M5YBCQGR8W', 'eur', '{"value": "10", "precision": 20}', 1, '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1FMF72K6Z7N13PNDTZ', NULL, 'pset_01M2AQBK1GG7PHCXX05BQTHEB1', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.708+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1GCZ83JF0XB20KZJGV', NULL, 'pset_01M2AQBK1GG7PHCXX05BQTHEB1', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.708+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1G4FVMTD2F2DA6GMMH', NULL, 'pset_01M2AQBK1GCWPHD2M7GNPV7007', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.742+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1GM1Z549J3V0A2ZJ64', NULL, 'pset_01M2AQBK1GCWPHD2M7GNPV7007', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.742+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1HBFHPWKGDEYXECY67', NULL, 'pset_01M2AQBK1HV4QABXJME4XDSG4D', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.753+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1H299SVMRWVSXF7G72', NULL, 'pset_01M2AQBK1HV4QABXJME4XDSG4D', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.753+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1HQ2FBX18X1ARN91FE', NULL, 'pset_01M2AQBK1HQ1D3BV9W6WTT3QZV', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.763+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1HSZYJ7R8GHBCNAX1S', NULL, 'pset_01M2AQBK1HQ1D3BV9W6WTT3QZV', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.763+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1HV39YPVFPDPXX4R1A', NULL, 'pset_01M2AQBK1H62RVKTGNB9853X5G', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.773+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1HZ3WMWXG0AY7WZ7JW', NULL, 'pset_01M2AQBK1H62RVKTGNB9853X5G', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.773+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JHKGC1ECWJWM9YZDA', NULL, 'pset_01M2AQBK1JX3A7MX15VM1KBCD8', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.783+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JJWKTC9DCR8CNN6E6', NULL, 'pset_01M2AQBK1JX3A7MX15VM1KBCD8', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.783+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JC3XPHFMY00H5DZTG', NULL, 'pset_01M2AQBK1JQZ1GVEDKN690K2CE', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.793+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JB6Q7KKWZFKXF42P7', NULL, 'pset_01M2AQBK1JQZ1GVEDKN690K2CE', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.793+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JVY65XY5XFH988HNV', NULL, 'pset_01M2AQBK1JJR2WW9Q01VK25DZV', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.803+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1JX49BD3RA66ENYDJ9', NULL, 'pset_01M2AQBK1JJR2WW9Q01VK25DZV', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.803+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1KRM1A1DQ5T9Z015CC', NULL, 'pset_01M2AQBK1KX50JB3AYFV1ZT6A1', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.812+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1K66TFWR13N04NZBRG', NULL, 'pset_01M2AQBK1KX50JB3AYFV1ZT6A1', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.812+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1KWVAN1N5YNJY817R8', NULL, 'pset_01M2AQBK1KTPSFD2KZG138JTWB', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.823+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1KYH9TSPGC8X8AEMFS', NULL, 'pset_01M2AQBK1KTPSFD2KZG138JTWB', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.823+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1KY411MFF39MP43HKB', NULL, 'pset_01M2AQBK1K4CMG0KZN510HZG6M', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.831+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1KZWDM4YEYNTXB7MYF', NULL, 'pset_01M2AQBK1K4CMG0KZN510HZG6M', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.831+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1M79P80SR2N3ZT8ASP', NULL, 'pset_01M2AQBK1MCVBBR5MQ0VDMMQCS', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.841+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1M06181NNR0J8GCBKR', NULL, 'pset_01M2AQBK1MCVBBR5MQ0VDMMQCS', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.841+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1M3TCDAZP39MGR1S36', NULL, 'pset_01M2AQBK1MKASBGZE9SP9VKNWD', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.85+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1MKPGSXFZNHWJX5ZRC', NULL, 'pset_01M2AQBK1MKASBGZE9SP9VKNWD', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.85+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1MSHJYM2X63K5VZC0Q', NULL, 'pset_01M2AQBK1MKHK4KRXWSP2K79AJ', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.859+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1M9ZQ4KEZN1C18Q1HV', NULL, 'pset_01M2AQBK1MKHK4KRXWSP2K79AJ', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.859+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NBE6E0Q0YSTJPM7C4', NULL, 'pset_01M2AQBK1NVK4ZPPSDT08WMNE8', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.868+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NSRJ8MXQSAN8AXXNE', NULL, 'pset_01M2AQBK1NVK4ZPPSDT08WMNE8', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.868+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NY8TYVHJ8K154X4VT', NULL, 'pset_01M2AQBK1NZV1ZYY0MNZX8BBW1', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.877+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NNTPVX2TJ6D59WDWE', NULL, 'pset_01M2AQBK1NZV1ZYY0MNZX8BBW1', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.877+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NY849XRPNA6Q1XCHM', NULL, 'pset_01M2AQBK1NGGGVY8SYRWBWCWTH', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.886+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1NRPCXBNREAMT93SMH', NULL, 'pset_01M2AQBK1NGGGVY8SYRWBWCWTH', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.886+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1P8N3DBSCMSTAEQ62J', NULL, 'pset_01M2AQBK1PEHJTJVDZRQ08DJKE', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.898+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1PQREW4YX0T6K5TPS9', NULL, 'pset_01M2AQBK1PEHJTJVDZRQ08DJKE', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.898+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1P0050KJ0WSGC582G2', NULL, 'pset_01M2AQBK1PKZMP4WV0BG2JKTA2', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.908+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1PHQWH0R9AX7BQ43KH', NULL, 'pset_01M2AQBK1PKZMP4WV0BG2JKTA2', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.908+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1PJ48Y59RG14RTSP1T', NULL, 'pset_01M2AQBK1PYT361RME8Y6RPDYS', 'eur', '{"value": "10", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.917+06', '2026-09-12 18:46:44.696+06', NULL, 10, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2AQBK1PD11MHMJSEYCCHHNB', NULL, 'pset_01M2AQBK1PYT361RME8Y6RPDYS', 'usd', '{"value": "15", "precision": 20}', 0, '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.917+06', '2026-09-12 18:46:44.696+06', NULL, 15, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXQQA2739806TDMFATR', NULL, 'pset_01M2ATGAXRAPEKK2YS6HBCF70H', 'gbp', '{"value": "45", "precision": 20}', 0, '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.415+06', '2026-09-15 19:53:05.399+06', NULL, 45, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXQYZ46VP4RHDZ9MCJX', NULL, 'pset_01M2ATGAXRAPEKK2YS6HBCF70H', 'eur', '{"value": "54", "precision": 20}', 0, '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.415+06', '2026-09-15 19:53:05.399+06', NULL, 54, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXQZ3A3WCT87M0RQF5G', NULL, 'pset_01M2ATGAXRAPEKK2YS6HBCF70H', 'usd', '{"value": "58", "precision": 20}', 0, '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.415+06', '2026-09-15 19:53:05.399+06', NULL, 58, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXRA0HNN8B5E1HZM1SQ', NULL, 'pset_01M2ATGAXR4P8NFFC1ZTE8QZZY', 'gbp', '{"value": "48", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.449+06', '2026-09-15 19:53:05.399+06', NULL, 48, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXRV6R5N9DB6B1GVGXE', NULL, 'pset_01M2ATGAXR4P8NFFC1ZTE8QZZY', 'eur', '{"value": "58", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.449+06', '2026-09-15 19:53:05.399+06', NULL, 58, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXRZ0FBZFDC6F4A099D', NULL, 'pset_01M2ATGAXR4P8NFFC1ZTE8QZZY', 'usd', '{"value": "62", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.45+06', '2026-09-15 19:53:05.399+06', NULL, 62, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXRJGV5M5S0MZNEADEF', NULL, 'pset_01M2ATGAXSSM6MJ5XAP1PS6NYW', 'gbp', '{"value": "42", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.466+06', '2026-09-15 19:53:05.399+06', NULL, 42, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXSHS8GCTDKZ3FBH4GZ', NULL, 'pset_01M2ATGAXSSM6MJ5XAP1PS6NYW', 'eur', '{"value": "50", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.466+06', '2026-09-15 19:53:05.399+06', NULL, 50, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXSB1MK750FAFAGH27C', NULL, 'pset_01M2ATGAXSSM6MJ5XAP1PS6NYW', 'usd', '{"value": "55", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.466+06', '2026-09-15 19:53:05.399+06', NULL, 55, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXS7AK21JY8KXYHR243', NULL, 'pset_01M2ATGAXSX7101VAGEPEA800P', 'gbp', '{"value": "24", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.482+06', '2026-09-15 19:53:05.399+06', NULL, 24, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXSWAFCWKWNM994VCNT', NULL, 'pset_01M2ATGAXSX7101VAGEPEA800P', 'eur', '{"value": "29", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.482+06', '2026-09-15 19:53:05.399+06', NULL, 29, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXSKX4S9AGY9ZMWQ5HV', NULL, 'pset_01M2ATGAXSX7101VAGEPEA800P', 'usd', '{"value": "31", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.482+06', '2026-09-15 19:53:05.399+06', NULL, 31, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXTQNDF8SJBKA71DQVN', NULL, 'pset_01M2ATGAXT6Z8P07392P3M49GT', 'gbp', '{"value": "26", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.496+06', '2026-09-15 19:53:05.399+06', NULL, 26, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXTPC2M3PKZ60C3EJ20', NULL, 'pset_01M2ATGAXT6Z8P07392P3M49GT', 'eur', '{"value": "31", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.496+06', '2026-09-15 19:53:05.399+06', NULL, 31, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXT44Q5V3W2P8KKBGQS', NULL, 'pset_01M2ATGAXT6Z8P07392P3M49GT', 'usd', '{"value": "34", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.496+06', '2026-09-15 19:53:05.399+06', NULL, 34, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXT5GMC79C1CAXQ0WNN', NULL, 'pset_01M2ATGAXT3EQNCMT0T7SJ68B1', 'gbp', '{"value": "8.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.51+06', '2026-09-15 19:53:05.399+06', NULL, 8.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXT20ZMVK63P0E3Z1MS', NULL, 'pset_01M2ATGAXT3EQNCMT0T7SJ68B1', 'eur', '{"value": "10.08", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.51+06', '2026-09-15 19:53:05.399+06', NULL, 10.08, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXTTRNEQ5H56ZP8DDR6', NULL, 'pset_01M2ATGAXT3EQNCMT0T7SJ68B1', 'usd', '{"value": "10.92", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.51+06', '2026-09-15 19:53:05.399+06', NULL, 10.92, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXVEGCKJNSF2Z84DNXH', NULL, 'pset_01M2ATGAXV330JQR1C9FYSVD0N', 'gbp', '{"value": "15.6", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.524+06', '2026-09-15 19:53:05.399+06', NULL, 15.6, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXVTJB0N0P46KR1MQXZ', NULL, 'pset_01M2ATGAXV330JQR1C9FYSVD0N', 'eur', '{"value": "18.72", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.524+06', '2026-09-15 19:53:05.399+06', NULL, 18.72, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXVGREZFCB4CM7GJ8M0', NULL, 'pset_01M2ATGAXV330JQR1C9FYSVD0N', 'usd', '{"value": "20.28", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.524+06', '2026-09-15 19:53:05.399+06', NULL, 20.28, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXVHXJ6KBSW7EXA5HJX', NULL, 'pset_01M2ATGAXVF50798VQDA95Z9HT', 'gbp', '{"value": "8.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.539+06', '2026-09-15 19:53:05.399+06', NULL, 8.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXV052HS8G897QZ1B2C', NULL, 'pset_01M2ATGAXVF50798VQDA95Z9HT', 'eur', '{"value": "10.08", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.539+06', '2026-09-15 19:53:05.399+06', NULL, 10.08, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXVXDFDJGV5W4WYEVT1', NULL, 'pset_01M2ATGAXVF50798VQDA95Z9HT', 'usd', '{"value": "10.92", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.539+06', '2026-09-15 19:53:05.399+06', NULL, 10.92, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXV9NXEJJT82XPA0HBH', NULL, 'pset_01M2ATGAXWAAC8Q62AQHQS2SE7', 'gbp', '{"value": "14.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.553+06', '2026-09-15 19:53:05.399+06', NULL, 14.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWZCNZ1VHYXG75W88F', NULL, 'pset_01M2ATGAXWAAC8Q62AQHQS2SE7', 'eur', '{"value": "17.28", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.553+06', '2026-09-15 19:53:05.399+06', NULL, 17.28, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWCJ1XRH8T5SZHN8N8', NULL, 'pset_01M2ATGAXWAAC8Q62AQHQS2SE7', 'usd', '{"value": "18.72", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.553+06', '2026-09-15 19:53:05.399+06', NULL, 18.72, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWAJVF0T9HQYV9E3DG', NULL, 'pset_01M2ATGAXWFAXQ7SZD88BV791V', 'gbp', '{"value": "8.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.567+06', '2026-09-15 19:53:05.399+06', NULL, 8.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWPG3GVSZGXSCWP5JP', NULL, 'pset_01M2ATGAXWFAXQ7SZD88BV791V', 'eur', '{"value": "10.08", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.567+06', '2026-09-15 19:53:05.399+06', NULL, 10.08, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWR8SEF2RXP0Z62KMH', NULL, 'pset_01M2ATGAXWFAXQ7SZD88BV791V', 'usd', '{"value": "10.92", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.567+06', '2026-09-15 19:53:05.399+06', NULL, 10.92, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXWHVAPY0T6YJ9E9ZVZ', NULL, 'pset_01M2ATGAXXGXY42YZ2JB95HSGP', 'gbp', '{"value": "14.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.582+06', '2026-09-15 19:53:05.399+06', NULL, 14.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXX18Z1TZYP3756ZVY8', NULL, 'pset_01M2ATGAXXGXY42YZ2JB95HSGP', 'eur', '{"value": "17.28", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.582+06', '2026-09-15 19:53:05.399+06', NULL, 17.28, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXX70F4BKYVQJKY8ASF', NULL, 'pset_01M2ATGAXXGXY42YZ2JB95HSGP', 'usd', '{"value": "18.72", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.582+06', '2026-09-15 19:53:05.399+06', NULL, 18.72, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXXKHRR850B76PCX471', NULL, 'pset_01M2ATGAXXA6KJ1EPK4KQNWXC2', 'gbp', '{"value": "8.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.598+06', '2026-09-15 19:53:05.399+06', NULL, 8.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXXTKFF33QJCRJR92E3', NULL, 'pset_01M2ATGAXXA6KJ1EPK4KQNWXC2', 'eur', '{"value": "10.08", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.598+06', '2026-09-15 19:53:05.399+06', NULL, 10.08, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXXXTA648NW5R2S0DYR', NULL, 'pset_01M2ATGAXXA6KJ1EPK4KQNWXC2', 'usd', '{"value": "10.92", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.598+06', '2026-09-15 19:53:05.399+06', NULL, 10.92, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXX3NM6KZD1Y0WB6BW5', NULL, 'pset_01M2ATGAXYYSQSKPXR43HNKY1H', 'gbp', '{"value": "12", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.613+06', '2026-09-15 19:53:05.399+06', NULL, 12, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXXN7QQKVWTYRDN29RV', NULL, 'pset_01M2ATGAXYYSQSKPXR43HNKY1H', 'eur', '{"value": "14.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.613+06', '2026-09-15 19:53:05.399+06', NULL, 14.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXYS3MGS0CG934SB2VX', NULL, 'pset_01M2ATGAXYYSQSKPXR43HNKY1H', 'usd', '{"value": "15.6", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.613+06', '2026-09-15 19:53:05.399+06', NULL, 15.6, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXY298QQFGSCNG97MP2', NULL, 'pset_01M2ATGAXYHAVPM7E2GDEX9Y2T', 'gbp', '{"value": "9.6", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.624+06', '2026-09-15 19:53:05.399+06', NULL, 9.6, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXY1DJMNVR83R807KWA', NULL, 'pset_01M2ATGAXYHAVPM7E2GDEX9Y2T', 'eur', '{"value": "11.52", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.624+06', '2026-09-15 19:53:05.399+06', NULL, 11.52, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXYQT5QTAX5FDAGQ6CX', NULL, 'pset_01M2ATGAXYHAVPM7E2GDEX9Y2T', 'usd', '{"value": "12.48", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.624+06', '2026-09-15 19:53:05.399+06', NULL, 12.48, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXY6E2K5JDY0RVRBGC2', NULL, 'pset_01M2ATGAXZ0H5PQ69XZYKCNAXT', 'gbp', '{"value": "20.4", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.634+06', '2026-09-15 19:53:05.399+06', NULL, 20.4, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXYZ8H5650B4TWGSWRQ', NULL, 'pset_01M2ATGAXZ0H5PQ69XZYKCNAXT', 'eur', '{"value": "24.48", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.634+06', '2026-09-15 19:53:05.399+06', NULL, 24.48, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXZ49PYPMJ6579G57AA', NULL, 'pset_01M2ATGAXZ0H5PQ69XZYKCNAXT', 'usd', '{"value": "26.52", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.634+06', '2026-09-15 19:53:05.399+06', NULL, 26.52, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXZYCPQ39C95B45XPCC', NULL, 'pset_01M2ATGAXZTHX72TD0F26S2J8Y', 'gbp', '{"value": "19.2", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.645+06', '2026-09-15 19:53:05.399+06', NULL, 19.2, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXZ595VARKA2WQPBYH0', NULL, 'pset_01M2ATGAXZTHX72TD0F26S2J8Y', 'eur', '{"value": "23.04", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.645+06', '2026-09-15 19:53:05.399+06', NULL, 23.04, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAXZTV6AARQFAF8BXC0N', NULL, 'pset_01M2ATGAXZTHX72TD0F26S2J8Y', 'usd', '{"value": "24.96", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.645+06', '2026-09-15 19:53:05.399+06', NULL, 24.96, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAY01HF01WFQMHP11JX8', NULL, 'pset_01M2ATGAY03K5MCZRRFDRXQ673', 'gbp', '{"value": "31.2", "precision": 20}', 0, '2026-09-12 18:47:01.57+06', '2026-09-15 19:53:05.656+06', '2026-09-15 19:53:05.399+06', NULL, 31.2, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAY00VD8FBG7BH4A8H9G', NULL, 'pset_01M2ATGAY03K5MCZRRFDRXQ673', 'eur', '{"value": "37.44", "precision": 20}', 0, '2026-09-12 18:47:01.571+06', '2026-09-15 19:53:05.656+06', '2026-09-15 19:53:05.399+06', NULL, 37.44, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2ATGAY0S6M47GMVQY42F7ME', NULL, 'pset_01M2ATGAY03K5MCZRRFDRXQ673', 'usd', '{"value": "40.56", "precision": 20}', 0, '2026-09-12 18:47:01.571+06', '2026-09-15 19:53:05.656+06', '2026-09-15 19:53:05.399+06', NULL, 40.56, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJEAQAZHW4T46GRYTK1', NULL, 'pset_01M2JNFFJFQBTS4ENV6TQRT3J0', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJE6TVNED8WM7JZFKEV', NULL, 'pset_01M2JNFFJFQBTS4ENV6TQRT3J0', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJEFBDN8PE7Y2N1EPWP', NULL, 'pset_01M2JNFFJFQBTS4ENV6TQRT3J0', 'eur', '{"value": "230", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 230, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJF3F52E3TDAP27G24Q', NULL, 'pset_01M2JNFFJFJ0F8YE84B2WPNH60', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJF35V7F3JHXQAMT53Z', NULL, 'pset_01M2JNFFJFJ0F8YE84B2WPNH60', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJFYCATMB6BGZVZ2FNC', NULL, 'pset_01M2JNFFJFV9BHXKVVX5ZRD8H4', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJFCMM945AF1ND7140C', NULL, 'pset_01M2JNFFJFV9BHXKVVX5ZRD8H4', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJFBXZG7BRF7JAXPQMW', NULL, 'pset_01M2JNFFJGASP8ZH6SE6XY57ZY', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGKT9TG9YF29Z71PDT', NULL, 'pset_01M2JNFFJGASP8ZH6SE6XY57ZY', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGXT9E7ZK6B0G1E6JA', NULL, 'pset_01M2JNFFJGFWK25VR6WG1NS7RY', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGEHCXX9SVXHVE7MP1', NULL, 'pset_01M2JNFFJGFWK25VR6WG1NS7RY', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGQEEQ25EZZZJRAEJ1', NULL, 'pset_01M2JNFFJG2Y5ZWXFR89G0YAVB', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGVG0F58MME0ZBGHEK', NULL, 'pset_01M2JNFFJG2Y5ZWXFR89G0YAVB', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJGEVS7CQC5QXXE6CD2', NULL, 'pset_01M2JNFFJHJ3JCH86K4AVT8TKB', 'usd', '{"value": "249", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 249, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJHT4MJ8AGY4MTEH28G', NULL, 'pset_01M2JNFFJHJ3JCH86K4AVT8TKB', 'gbp', '{"value": "195", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 195, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJHXSJP8N6DN39F0DDR', NULL, 'pset_01M2JNFFJH3X20V8R5M6J5BR2F', 'usd', '{"value": "39", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 39, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJHYY38WX02APTB2DZ9', NULL, 'pset_01M2JNFFJH3X20V8R5M6J5BR2F', 'gbp', '{"value": "30", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 30, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJH6RTFDDN7QDV8PN9D', NULL, 'pset_01M2JNFFJH30WKDGGQJS206GB2', 'usd', '{"value": "39", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 39, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJHA3RVGYR0SADCYYEG', NULL, 'pset_01M2JNFFJH30WKDGGQJS206GB2', 'gbp', '{"value": "30", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 30, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJH5F6FZNEKE74K5210', NULL, 'pset_01M2JNFFJJVSKMG23NFXM5B2P0', 'usd', '{"value": "25", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 25, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJ0M4MTK7XNXWYXKB8', NULL, 'pset_01M2JNFFJJVSKMG23NFXM5B2P0', 'gbp', '{"value": "20", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 20, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJVHY7E37EYRASWF6W', NULL, 'pset_01M2JNFFJJ5PFDFSR9NFKE6RY1', 'usd', '{"value": "39", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 39, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJF3912RFSDWTHJQ3P', NULL, 'pset_01M2JNFFJJ5PFDFSR9NFKE6RY1', 'gbp', '{"value": "30", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 30, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJQ3NB1G2WNGEBG5K4', NULL, 'pset_01M2JNFFJJWA083QTZYM0QC2KN', 'usd', '{"value": "35", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 35, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJQ8SHSP6GAT5J6YRT', NULL, 'pset_01M2JNFFJJWA083QTZYM0QC2KN', 'gbp', '{"value": "28", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 28, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJT3ENT8ZAXK0TJH3J', NULL, 'pset_01M2JNFFJKA70E31A9RX4C05Y2', 'usd', '{"value": "33", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 33, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJJ7NTDVWSKT9T5HFPW', NULL, 'pset_01M2JNFFJKA70E31A9RX4C05Y2', 'gbp', '{"value": "26", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 26, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJK6MRS5TCMKQQ9EK44', NULL, 'pset_01M2JNFFJKKJGZ2CAS2ZE1H94T', 'usd', '{"value": "129", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 129, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJKCGWVPTWEVP567RBZ', NULL, 'pset_01M2JNFFJKKJGZ2CAS2ZE1H94T', 'gbp', '{"value": "100", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 100, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJK3ZX0VQ02GVKVQSYN', NULL, 'pset_01M2JNFFJKPEVXN8JZ8G97Z4TP', 'usd', '{"value": "199", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 199, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJK5AB70X9B1EZW95FY', NULL, 'pset_01M2JNFFJKPEVXN8JZ8G97Z4TP', 'gbp', '{"value": "155", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 155, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJK3N0WEZSENBN8VTA3', NULL, 'pset_01M2JNFFJKS5PTA7HQ5PTAMNQ6', 'usd', '{"value": "349", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 349, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJKYC422JHSXDX4C0YY', NULL, 'pset_01M2JNFFJKS5PTA7HQ5PTAMNQ6', 'gbp', '{"value": "270", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 270, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJM91TYS3KN28B7WEMS', NULL, 'pset_01M2JNFFJMJSYYVW8CNFK9Y2ES', 'usd', '{"value": "599", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 599, NULL, NULL, NULL, NULL);
INSERT INTO "public"."price" ("id", "title", "price_set_id", "currency_code", "raw_amount", "rules_count", "created_at", "updated_at", "deleted_at", "price_list_id", "amount", "min_quantity", "max_quantity", "raw_min_quantity", "raw_max_quantity") VALUES ('price_01M2JNFFJME7HR74KER67Z30BP', NULL, 'pset_01M2JNFFJMJSYYVW8CNFK9Y2ES', 'gbp', '{"value": "465", "precision": 20}', 0, '2026-09-15 19:53:06.133+06', '2026-09-15 19:53:06.133+06', NULL, NULL, 465, NULL, NULL, NULL, NULL);


--
-- Data for Name: price_list; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: price_list_rule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: price_preference; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."price_preference" ("id", "attribute", "value", "is_tax_inclusive", "created_at", "updated_at", "deleted_at") VALUES ('prpref_01M2AQBJ8Y9PKVXTG9YE51WEW0', 'currency_code', 'eur', false, '2026-09-12 17:51:59.519+06', '2026-09-12 17:51:59.519+06', NULL);
INSERT INTO "public"."price_preference" ("id", "attribute", "value", "is_tax_inclusive", "created_at", "updated_at", "deleted_at") VALUES ('prpref_01M2AQBJ8Y5303WES1WV4JR1JP', 'currency_code', 'usd', false, '2026-09-12 17:51:59.519+06', '2026-09-12 17:51:59.519+06', NULL);
INSERT INTO "public"."price_preference" ("id", "attribute", "value", "is_tax_inclusive", "created_at", "updated_at", "deleted_at") VALUES ('prpref_01M2AQBJAPGJ1RYZTFDR3TKN4N', 'region_id', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', false, '2026-09-12 17:51:59.575+06', '2026-09-12 17:51:59.575+06', NULL);


--
-- Data for Name: price_rule; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."price_rule" ("id", "value", "priority", "price_id", "created_at", "updated_at", "deleted_at", "attribute", "operator") VALUES ('prule_01M2AQBJFXT8CPWZGRWRY233JX', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', 0, 'price_01M2AQBJFX6PZNAERZG334HMKG', '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, 'region_id', 'eq');
INSERT INTO "public"."price_rule" ("id", "value", "priority", "price_id", "created_at", "updated_at", "deleted_at", "attribute", "operator") VALUES ('prule_01M2AQBJFYANHHXMVTYP1BE6S1', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', 0, 'price_01M2AQBJFY8MFRPS0P91ZV9SRB', '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL, 'region_id', 'eq');


--
-- Data for Name: price_set; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBJFXNGW6V9K3GTXFPK8S', '2026-09-12 17:51:59.742+06', '2026-09-12 17:51:59.742+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBJFYYF92V5M5YBCQGR8W', '2026-09-12 17:51:59.743+06', '2026-09-12 17:51:59.743+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1GG7PHCXX05BQTHEB1', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.697+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1GCWPHD2M7GNPV7007', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.732+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1HV4QABXJME4XDSG4D', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.748+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1HQ1D3BV9W6WTT3QZV', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.758+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1H62RVKTGNB9853X5G', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.768+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1JX3A7MX15VM1KBCD8', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.778+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1JQZ1GVEDKN690K2CE', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.788+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1JJR2WW9Q01VK25DZV', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.799+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1KX50JB3AYFV1ZT6A1', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.808+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1KTPSFD2KZG138JTWB', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.819+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1K4CMG0KZN510HZG6M', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.828+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1MCVBBR5MQ0VDMMQCS', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.836+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1MKASBGZE9SP9VKNWD', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.846+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1MKHK4KRXWSP2K79AJ', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.855+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1NVK4ZPPSDT08WMNE8', '2026-09-12 17:52:00.311+06', '2026-09-12 18:46:44.864+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1NZV1ZYY0MNZX8BBW1', '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.873+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1NGGGVY8SYRWBWCWTH', '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.882+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1PEHJTJVDZRQ08DJKE', '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.894+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1PKZMP4WV0BG2JKTA2', '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.904+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2AQBK1PYT361RME8Y6RPDYS', '2026-09-12 17:52:00.312+06', '2026-09-12 18:46:44.913+06', '2026-09-12 18:46:44.696+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXRAPEKK2YS6HBCF70H', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.399+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXR4P8NFFC1ZTE8QZZY', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.442+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXSSM6MJ5XAP1PS6NYW', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.457+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXSX7101VAGEPEA800P', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.474+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXT6Z8P07392P3M49GT', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.488+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXT3EQNCMT0T7SJ68B1', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.502+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXV330JQR1C9FYSVD0N', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.516+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXVF50798VQDA95Z9HT', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.531+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXWAAC8Q62AQHQS2SE7', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.546+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXWFAXQ7SZD88BV791V', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.56+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXXGXY42YZ2JB95HSGP', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.575+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXXA6KJ1EPK4KQNWXC2', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.59+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXYYSQSKPXR43HNKY1H', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.606+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXYHAVPM7E2GDEX9Y2T', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.62+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXZ0H5PQ69XZYKCNAXT', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.63+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAXZTHX72TD0F26S2J8Y', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.641+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2ATGAY03K5MCZRRFDRXQ673', '2026-09-12 18:47:01.569+06', '2026-09-15 19:53:05.652+06', '2026-09-15 19:53:05.399+06');
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJFQBTS4ENV6TQRT3J0', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJFJ0F8YE84B2WPNH60', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJFV9BHXKVVX5ZRD8H4', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJGASP8ZH6SE6XY57ZY', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJGFWK25VR6WG1NS7RY', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJG2Y5ZWXFR89G0YAVB', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJHJ3JCH86K4AVT8TKB', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJH3X20V8R5M6J5BR2F', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJH30WKDGGQJS206GB2', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJJVSKMG23NFXM5B2P0', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJJ5PFDFSR9NFKE6RY1', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJJWA083QTZYM0QC2KN', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJKA70E31A9RX4C05Y2', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJKKJGZ2CAS2ZE1H94T', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJKPEVXN8JZ8G97Z4TP', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJKS5PTA7HQ5PTAMNQ6', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);
INSERT INTO "public"."price_set" ("id", "created_at", "updated_at", "deleted_at") VALUES ('pset_01M2JNFFJMJSYYVW8CNFK9Y2ES', '2026-09-15 19:53:06.132+06', '2026-09-15 19:53:06.132+06', NULL);


--
-- Data for Name: product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGAN90BGWA41FGYCFNY47', 'PEPTECH Reusable Pen Set — Retatrutide 10mg', 'pen-retatrutide-10', NULL, 'The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 10mg Retatrutide cartridge (HPLC 99.4%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.363+06', '2026-09-15 19:53:05.361+06', '{"batch": "RT-2609A", "format": "pen-set", "purity": "99.4%", "category": "complete-pen-sets", "strength": "10mg Cartridge", "labReportUrl": "/lab-reports/RT-2609A.pdf", "purchaseType": "one-time", "compatibleRefillSku": "REF-RT-10"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA192KFRCDZMG8B070', 'PEPTECH Reusable Pen Set — Tirzepatide 15mg', 'pen-tirzepatide-15', NULL, 'The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 15mg Tirzepatide cartridge (HPLC 99.2%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.391+06', '2026-09-15 19:53:05.361+06', '{"batch": "TR-2609B", "format": "pen-set", "purity": "99.2%", "category": "complete-pen-sets", "strength": "15mg Cartridge", "labReportUrl": "/lab-reports/TR-2609B.pdf", "purchaseType": "one-time", "compatibleRefillSku": "REF-TR-15"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA0JDR8BY2GGR4VWPM', 'PEPTECH Reusable Pen Set — Semaglutide 10mg', 'pen-semaglutide-10', NULL, 'The complete starter package for laboratory research. Each set includes our medical-grade reusable precision aluminum pen, a prefilled certified 10mg Semaglutide cartridge (HPLC 99.5%), serialized device passport card, 5x sterile 31G 5mm ultra-fine needles, and 10x alcohol prep pads. One-time purchase only.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.402+06', '2026-09-15 19:53:05.361+06', '{"batch": "SM-2609A", "format": "pen-set", "purity": "99.5%", "category": "complete-pen-sets", "strength": "10mg Cartridge", "labReportUrl": "/lab-reports/SM-2609A.pdf", "purchaseType": "one-time", "compatibleRefillSku": "REF-SM-10"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAXZM8WKWA9BMZJ502', 'PEPTECH Refill Cartridge — Retatrutide 10mg', 'refill-retatrutide-10', NULL, 'High-purity prefilled replacement cartridge designed exclusively for the reusable PEPTECH precision pen system. Batch-certified HPLC 99.4%. Order single replacements or choose Subscribe & Save every 28 days for automated dispatch and 10% savings.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.41+06', '2026-09-15 19:53:05.361+06', '{"batch": "RT-2609A", "format": "refill", "purity": "99.4%", "category": "refill-cartridges", "strength": "10mg", "compatibility": "Compatible exclusively with the PEPTECH Reusable Pen", "matchingPenSetSku": "PEN-RT-10", "subscriptionDiscount": 10, "subscriptionPriceGbp": 21.6, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7M2HE0K6HSNC01HM3', 'RT40 Pen System', 'pen-system-rt40', NULL, 'Complete starter set with reusable precision pen and RT40 cartridge for food safety testing.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Food Safety Testing", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7Z33KKW3RW4V9GM3B', 'C.C-1236 Pen System', 'pen-system-cc1236', NULL, 'Complete starter set with reusable precision pen and C.C-1236 cartridge for environmental testing.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Environmental Testing", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7PXMJQVTA67B7G3Y7', 'TB-S30 Pen System', 'pen-system-tbs30', NULL, 'Complete starter set with reusable precision pen and TB-S30 cartridge for healthcare testing.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Healthcare Testing", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7NXMF3MP07YRVH1N5', 'IFC-137 Pen System', 'pen-system-ifc137', NULL, 'Complete starter set with reusable precision pen and IFC-137 cartridge for industrial hygiene.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Industrial Hygiene", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB78W2AM1HRRAVMK1EP', 'GVK-00 50 Pen System', 'pen-system-gvk0050', NULL, 'Complete starter set with reusable precision pen and GVK-00 50 cartridge for water quality testing.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Water Quality Testing", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB719H38XS9QVG62Q49', 'Melatonin II Pen System', 'pen-system-melatonin2', NULL, 'Complete starter set with reusable precision pen and Melatonin II cartridge for mycotoxin detection.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "Mycotoxin Detection", "purchaseType": "one-time"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7384WWNWAF45XZHCD', 'RT40 Test Cartridge', 'cartridge-rt40', NULL, 'Replacement cartridge for RT40 food safety testing. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', 'C.C-1236 Test Cartridge', 'cartridge-cc1236', NULL, 'Replacement cartridge for C.C-1236 environmental testing. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB7FG04XZFBMCF9PG3R', 'TB-S30 Test Cartridge', 'cartridge-tbs30', NULL, 'Replacement cartridge for TB-S30 healthcare testing. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB79A5833XBWG8ZVY74', 'IFC-137 Test Cartridge', 'cartridge-ifc137', NULL, 'Replacement cartridge for IFC-137 industrial hygiene. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB72RQGK2MPCF3H35MS', 'GVK-00 50 Test Cartridge', 'cartridge-gvk0050', NULL, 'Replacement cartridge for GVK-00 50 water quality testing. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAVB31R7YTV0J72MBM', 'PEPTECH Refill Cartridge — Tirzepatide 15mg', 'refill-tirzepatide-15', NULL, 'High-purity prefilled replacement cartridge designed exclusively for the reusable PEPTECH precision pen system. Batch-certified HPLC 99.2%. Order single replacements or choose Subscribe & Save every 28 days for automated dispatch and 10% savings.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.421+06', '2026-09-15 19:53:05.361+06', '{"batch": "TR-2609B", "format": "refill", "purity": "99.2%", "category": "refill-cartridges", "strength": "15mg", "compatibility": "Compatible exclusively with the PEPTECH Reusable Pen", "matchingPenSetSku": "PEN-TR-15", "subscriptionDiscount": 10, "subscriptionPriceGbp": 23.4, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAM33CRP7W6CRQFY6W', 'Retatrutide 5mg Lyophilised Vial', 'vial-retatrutide-5mg', NULL, 'Individually vacuum-sealed, lyophilised Retatrutide peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.436+06', '2026-09-15 19:53:05.361+06', '{"code": "RT", "batch": "RT-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Retatrutide", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 7.56, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA2S8D747WKGY2K4VN', 'Retatrutide 10mg Lyophilised Vial', 'vial-retatrutide-10mg', NULL, 'Individually vacuum-sealed, lyophilised Retatrutide peptide vial (10mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.447+06', '2026-09-15 19:53:05.361+06', '{"code": "RT", "batch": "RT-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Retatrutide", "strength": "10mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 14.04, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANANSNTR0JBS35RYPQE', 'Tirzepatide 5mg Lyophilised Vial', 'vial-tirzepatide-5mg', NULL, 'Individually vacuum-sealed, lyophilised Tirzepatide peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.463+06', '2026-09-15 19:53:05.361+06', '{"code": "TR", "batch": "TR-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Tirzepatide", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 7.56, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA2CZ6A72H3C8P64WX', 'Tirzepatide 10mg Lyophilised Vial', 'vial-tirzepatide-10mg', NULL, 'Individually vacuum-sealed, lyophilised Tirzepatide peptide vial (10mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.302+06', '2026-09-15 19:53:05.48+06', '2026-09-15 19:53:05.361+06', '{"code": "TR", "batch": "TR-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Tirzepatide", "strength": "10mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 12.96, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', 'Semaglutide 5mg Lyophilised Vial', 'vial-semaglutide-5mg', NULL, 'Individually vacuum-sealed, lyophilised Semaglutide peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.494+06', '2026-09-15 19:53:05.361+06', '{"code": "SM", "batch": "SM-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Semaglutide", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 7.56, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAT2FBEDSJZZA4Q6VA', 'Semaglutide 10mg Lyophilised Vial', 'vial-semaglutide-10mg', NULL, 'Individually vacuum-sealed, lyophilised Semaglutide peptide vial (10mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.507+06', '2026-09-15 19:53:05.361+06', '{"code": "SM", "batch": "SM-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Semaglutide", "strength": "10mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 12.96, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA0BXCDK40PQ9T83ZP', 'GHK-CU 50mg Lyophilised Vial', 'vial-ghk-cu-50mg', NULL, 'Individually vacuum-sealed, lyophilised GHK-CU peptide vial (50mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.521+06', '2026-09-15 19:53:05.361+06', '{"code": "Cu50", "batch": "Cu50-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "GHK-CU", "strength": "50mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 7.56, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAY8BPHXGHRB53JA3E', 'GHK-CU 100mg Lyophilised Vial', 'vial-ghk-cu-100mg', NULL, 'Individually vacuum-sealed, lyophilised GHK-CU peptide vial (100mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.537+06', '2026-09-15 19:53:05.361+06', '{"code": "Cu100", "batch": "Cu100-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "GHK-CU", "strength": "100mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 10.8, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANA9QC2SPWE086NHCJE', 'BPC-157 5mg Lyophilised Vial', 'vial-bpc-157-5mg', NULL, 'Individually vacuum-sealed, lyophilised BPC-157 peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.551+06', '2026-09-15 19:53:05.361+06', '{"code": "BC5", "batch": "BC5-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "BPC-157", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 8.64, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANAY86Z05WDTJFTW3DX', 'TB500 5mg Lyophilised Vial', 'vial-tb500-5mg', NULL, 'Individually vacuum-sealed, lyophilised TB500 peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.565+06', '2026-09-15 19:53:05.361+06', '{"code": "TB5", "batch": "TB5-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "TB500", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 18.36, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANBXJKG5EERAKDBT0JY', 'NAD+ 500mg Lyophilised Vial', 'vial-nad-500mg', NULL, 'Individually vacuum-sealed, lyophilised NAD+ peptide vial (500mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.58+06', '2026-09-15 19:53:05.361+06', '{"code": "NJ500", "batch": "NJ500-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "NAD+", "strength": "500mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 17.28, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2ATGANB2P5PSXH9QVCYE0DG', 'Cagrilintide 5mg Lyophilised Vial', 'vial-cagrilintide-5mg', NULL, 'Individually vacuum-sealed, lyophilised Cagrilintide peptide vial (5mg) for laboratory research. Certified batch testing via HPLC and Mass Spectrometry. Available for One-Time purchase or Subscribe & Save every 28 days with 10% discount.', false, 'published', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.596+06', '2026-09-15 19:53:05.361+06', '{"code": "CGL5", "batch": "CGL5-2609", "format": "vial", "category": "freeze-dried-vials", "compound": "Cagrilintide", "strength": "5mg", "subscriptionDiscount": 10, "subscriptionPriceGbp": 28.08, "subscriptionIntervalDays": 28}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB778WNCQARVRDBAKVB', 'Complete PEPTECH® Pen Set', 'complete-pen-set', NULL, 'Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.', false, 'published', 'http://localhost:3000/images/peptech/mockup2.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.906+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "PEN SYSTEM", "format": "pen-set", "rating": 4.9, "category": "complete-pen-sets", "application": "All Laboratory Testing", "purchaseType": "one-time", "reviewsCount": 264}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB74H0D5GPKRVNXHDJY', 'Melatonin II Test Cartridge', 'cartridge-melatonin2', NULL, 'Replacement cartridge for Melatonin II mycotoxin detection. Compatible with PEPTECH reusable pen.', false, 'published', 'http://localhost:3000/images/peptech/cartridge.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Test Cartridge", "format": "refill", "category": "refill-cartridges", "subDiscountPercent": 10}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB8Z235WPXZ2T3GRCMT', 'Research Grade 5 mg Lyophilised Vial', 'vial-5mg', NULL, 'Research grade 5 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Freeze-Dried Vial", "format": "vial", "category": "freeze-dried-vials"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB8FV8CY4ZE47857C0M', 'Research Grade 10 mg Lyophilised Vial', 'vial-10mg', NULL, 'Research grade 10 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Freeze-Dried Vial", "format": "vial", "category": "freeze-dried-vials"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB8MTXS5VYCCMKHRSNH', 'Research Grade 25 mg Lyophilised Vial', 'vial-25mg', NULL, 'Research grade 25 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Freeze-Dried Vial", "format": "vial", "category": "freeze-dried-vials"}');
INSERT INTO "public"."product" ("id", "title", "handle", "subtitle", "description", "is_giftcard", "status", "thumbnail", "weight", "length", "height", "width", "origin_country", "hs_code", "mid_code", "material", "collection_id", "type_id", "discountable", "external_id", "created_at", "updated_at", "deleted_at", "metadata") VALUES ('prod_01M2JNFFB8VYA43RGVYJW3SG50', 'Research Grade 50 mg Lyophilised Vial', 'vial-50mg', NULL, 'Research grade 50 mg freeze-dried laboratory peptide vial. Sealed under nitrogen.', false, 'published', 'http://localhost:3000/images/peptech/front.webp', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, true, NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, '{"tag": "Freeze-Dried Vial", "format": "vial", "category": "freeze-dried-vials"}');


--
-- Data for Name: product_category; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2JNFFA4W9V8AJ0N3YTKF47T', 'Freeze-Dried Vials', 'High-purity laboratory lyophilised vials with verifiable HPLC & Mass Spectrometry lab reports. One-time purchase or 28-day Subscribe & Save.', 'freeze-dried-vials', 'pcat_01M2JNFFA4W9V8AJ0N3YTKF47T', true, false, 2, NULL, '2026-09-15 19:53:05.86+06', '2026-09-15 19:53:05.86+06', NULL, NULL, NULL);
INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2ATGAM7R40NB6R4VDG3A63W', 'Complete Pen Sets', 'First-time buyer starter package: Reusable precision aluminum pen, prefilled cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads. One-time purchase only.', 'complete-pen-sets', 'pcat_01M2ATGAM7R40NB6R4VDG3A63W', true, false, 0, NULL, '2026-09-12 18:47:01.256+06', '2026-09-15 19:53:05.847+06', '2026-09-15 19:53:05.847+06', NULL, NULL);
INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2ATGAM8VEH555CTTVH359DG', 'Refill Cartridges', 'Designed exclusively for the PEPTECH reusable pen system. Available for One-Time Purchase and 28-day Subscribe & Save (10% discount).', 'refill-cartridges', 'pcat_01M2ATGAM8VEH555CTTVH359DG', true, false, 0, NULL, '2026-09-12 18:47:01.257+06', '2026-09-15 19:53:05.847+06', '2026-09-15 19:53:05.846+06', NULL, NULL);
INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2ATGAM8ZD4VYESA7QFGFX8R', 'Freeze-Dried Vials', 'High-purity laboratory lyophilised vials with verifiable HPLC & Mass Spectrometry lab reports. One-time purchase or 28-day Subscribe & Save.', 'freeze-dried-vials', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R', true, false, 0, NULL, '2026-09-12 18:47:01.257+06', '2026-09-15 19:53:05.847+06', '2026-09-15 19:53:05.847+06', NULL, NULL);
INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2JNFFA34874NBN997RNTD3R', 'Complete Pen Sets', 'First-time buyer starter package: Reusable precision aluminum pen, prefilled cartridge, serialized device passport, 31G 5mm sterile needles, and alcohol prep pads. One-time purchase only.', 'complete-pen-sets', 'pcat_01M2JNFFA34874NBN997RNTD3R', true, false, 0, NULL, '2026-09-15 19:53:05.86+06', '2026-09-15 19:53:05.86+06', NULL, NULL, NULL);
INSERT INTO "public"."product_category" ("id", "name", "description", "handle", "mpath", "is_active", "is_internal", "rank", "parent_category_id", "created_at", "updated_at", "deleted_at", "metadata", "external_id") VALUES ('pcat_01M2JNFFA3TABJZH2KX9F5CZTM', 'Refill Cartridges', 'Designed exclusively for the PEPTECH reusable pen system. Available for One-Time Purchase and 28-day Subscribe & Save (10% discount).', 'refill-cartridges', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM', true, false, 1, NULL, '2026-09-15 19:53:05.86+06', '2026-09-15 19:53:05.86+06', NULL, NULL, NULL);


--
-- Data for Name: product_category_product; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGAN90BGWA41FGYCFNY47', 'pcat_01M2ATGAM7R40NB6R4VDG3A63W');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA192KFRCDZMG8B070', 'pcat_01M2ATGAM7R40NB6R4VDG3A63W');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA0JDR8BY2GGR4VWPM', 'pcat_01M2ATGAM7R40NB6R4VDG3A63W');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAXZM8WKWA9BMZJ502', 'pcat_01M2ATGAM8VEH555CTTVH359DG');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAVB31R7YTV0J72MBM', 'pcat_01M2ATGAM8VEH555CTTVH359DG');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAM33CRP7W6CRQFY6W', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA2S8D747WKGY2K4VN', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANANSNTR0JBS35RYPQE', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA2CZ6A72H3C8P64WX', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAT2FBEDSJZZA4Q6VA', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA0BXCDK40PQ9T83ZP', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAY8BPHXGHRB53JA3E', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANA9QC2SPWE086NHCJE', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANAY86Z05WDTJFTW3DX', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANBXJKG5EERAKDBT0JY', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2ATGANB2P5PSXH9QVCYE0DG', 'pcat_01M2ATGAM8ZD4VYESA7QFGFX8R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB778WNCQARVRDBAKVB', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7M2HE0K6HSNC01HM3', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7Z33KKW3RW4V9GM3B', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7PXMJQVTA67B7G3Y7', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7NXMF3MP07YRVH1N5', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB78W2AM1HRRAVMK1EP', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB719H38XS9QVG62Q49', 'pcat_01M2JNFFA34874NBN997RNTD3R');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7384WWNWAF45XZHCD', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB7FG04XZFBMCF9PG3R', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB79A5833XBWG8ZVY74', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB72RQGK2MPCF3H35MS', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB74H0D5GPKRVNXHDJY', 'pcat_01M2JNFFA3TABJZH2KX9F5CZTM');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB8Z235WPXZ2T3GRCMT', 'pcat_01M2JNFFA4W9V8AJ0N3YTKF47T');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB8FV8CY4ZE47857C0M', 'pcat_01M2JNFFA4W9V8AJ0N3YTKF47T');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB8MTXS5VYCCMKHRSNH', 'pcat_01M2JNFFA4W9V8AJ0N3YTKF47T');
INSERT INTO "public"."product_category_product" ("product_id", "product_category_id") VALUES ('prod_01M2JNFFB8VYA43RGVYJW3SG50', 'pcat_01M2JNFFA4W9V8AJ0N3YTKF47T');


--
-- Data for Name: product_collection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_option; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2AQBJJSXM68QBVA39WB33V3', 'Size', NULL, '2026-09-12 17:51:59.833+06', '2026-09-12 17:51:59.833+06', NULL, false);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2AQBJJSERPX68F899G1G5PZ', 'Color', NULL, '2026-09-12 17:51:59.833+06', '2026-09-12 17:51:59.833+06', NULL, false);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBC2V7J9KTHFYZ11WJ', 'Specification', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANB1A8M6SRRZZ243FQJ', 'Specification', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.734+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBCZA081QH07PJRYJF', 'Specification', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.739+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBT1NNFC93GS2R8WC1', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.744+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBV33105DQ2HGE7Q2B', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.749+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBW32526D91FM1EMAA', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.754+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBKMYQK38KM696KBC2', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.759+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBNKYPF0B7NYCPN6A9', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.763+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANB7AQNS2V1KQ712N1Y', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.767+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBRENYWQGMGW8FT3Y7', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.771+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBH12V4FN9WSN4TSAX', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.777+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBYC7T9AJBA26J7XMA', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.782+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBPBWP2YCWDN40E5E3', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.786+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBWE4GYSEN14YJRR9G', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.791+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANBHCS8RX7SF5Z4JP33', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.796+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANC4KKQ3K1G3R1DWQJ0', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.801+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2ATGANC4NMY838C5CCATE0V', 'Strength', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.806+06', '2026-09-15 19:53:05.718+06', true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB80393KF6WNPEKAJ04', 'System', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB8BDPNAHXKPZJSAT9R', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB89SZ9JF61FW0MZREX', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB80DSQ7K6D7CWX4NPQ', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB8WPXD0P0ZX0GP8347', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB82BV2TM5V1938ANG1', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB80JRYWY6TY192WSKW', 'Model', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB8P7YEE7MQSAHDF7MZ', 'Type', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB8FC6MRJSQ7Q2FWYZH', 'Type', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB89B1XK4YGWJ61QJ6R', 'Type', NULL, '2026-09-15 19:53:05.907+06', '2026-09-15 19:53:05.907+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB88EC7PDPYM5JFZ855', 'Type', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB9GDRBSE3672FTY02D', 'Type', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB915MP3QXXMC8AWZDV', 'Type', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB95JSSGQFRN5HH1HVA', 'Dose', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB9NHX4FR0B9HWHK7N1', 'Dose', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB92TQ91HS7KGKCNTJF', 'Dose', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);
INSERT INTO "public"."product_option" ("id", "title", "metadata", "created_at", "updated_at", "deleted_at", "is_exclusive") VALUES ('opt_01M2JNFFB9X8VAH5F7GAVNSRAM', 'Dose', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, true);


--
-- Data for Name: product_option_value; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJRYFF97F0NHND4MWKX', 'S', 'opt_01M2AQBJJSXM68QBVA39WB33V3', NULL, '2026-09-12 17:51:59.833+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJRSSXRV90AJMF7Z7HQ', 'M', 'opt_01M2AQBJJSXM68QBVA39WB33V3', NULL, '2026-09-12 17:51:59.834+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJRYM0STDYH668HVQDW', 'L', 'opt_01M2AQBJJSXM68QBVA39WB33V3', NULL, '2026-09-12 17:51:59.834+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJRCVYT333AFW1CMZWR', 'XL', 'opt_01M2AQBJJSXM68QBVA39WB33V3', NULL, '2026-09-12 17:51:59.834+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJSR8A4X034715Y23CD', 'Black', 'opt_01M2AQBJJSERPX68F899G1G5PZ', NULL, '2026-09-12 17:51:59.834+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2AQBJJSW97GVAGX6V33W6ZD', 'White', 'opt_01M2AQBJJSERPX68F899G1G5PZ', NULL, '2026-09-12 17:51:59.834+06', '2026-09-12 17:51:59.834+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANHZWFQNGWRP62MSRT3', '10mg Complete Starter Set', 'opt_01M2ATGANBC2V7J9KTHFYZ11WJ', NULL, '2026-09-12 18:47:01.303+06', '2026-09-15 19:53:05.734+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANJAJPT1VA0Q7J617VA', '15mg Complete Starter Set', 'opt_01M2ATGANB1A8M6SRRZZ243FQJ', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.738+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANJN7SXDEC1EBCZB9EY', '10mg Complete Starter Set', 'opt_01M2ATGANBCZA081QH07PJRYJF', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.744+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANJRXEXBKA33QG823SF', '10mg Cartridge', 'opt_01M2ATGANBT1NNFC93GS2R8WC1', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.749+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANJBVASGV2JG0KDV5KC', '15mg Cartridge', 'opt_01M2ATGANBV33105DQ2HGE7Q2B', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.753+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANJP952XVC5DARM0ECP', '5mg', 'opt_01M2ATGANBW32526D91FM1EMAA', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.759+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANKJ7792MNBPM13K2CA', '10mg', 'opt_01M2ATGANBKMYQK38KM696KBC2', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.763+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANKSH0Y6T25QKKD2F5E', '5mg', 'opt_01M2ATGANBNKYPF0B7NYCPN6A9', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.767+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANKQGKHRVQXFG815TS2', '10mg', 'opt_01M2ATGANB7AQNS2V1KQ712N1Y', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.771+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANKP1TZ09HE94W7ZE8T', '5mg', 'opt_01M2ATGANBRENYWQGMGW8FT3Y7', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.777+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANMFGQZXV9Q3Q1Q2ZHK', '10mg', 'opt_01M2ATGANBH12V4FN9WSN4TSAX', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.781+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANMJ4EQ2BGCPRPR2S88', '50mg', 'opt_01M2ATGANBYC7T9AJBA26J7XMA', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.785+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANM13T20SW04XT803M6', '100mg', 'opt_01M2ATGANBPBWP2YCWDN40E5E3', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.791+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANM9G8QM1YTESQTYNJG', '5mg', 'opt_01M2ATGANBWE4GYSEN14YJRR9G', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.796+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANMFQ20RCQB7ZCC4MVK', '5mg', 'opt_01M2ATGANBHCS8RX7SF5Z4JP33', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.8+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANM7DDGZ4FWKJ49CT0H', '500mg', 'opt_01M2ATGANC4KKQ3K1G3R1DWQJ0', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.805+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2ATGANM8A8KXYHX6HA6SQQ7', '5mg', 'opt_01M2ATGANC4NMY838C5CCATE0V', NULL, '2026-09-12 18:47:01.304+06', '2026-09-15 19:53:05.811+06', '2026-09-15 19:53:05.718+06', NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBE4XN4E3GZEC05N8YC', 'Complete Starter Kit', 'opt_01M2JNFFB80393KF6WNPEKAJ04', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBFRB0PNF69DN7E0G6T', 'RT40 Starter Set', 'opt_01M2JNFFB8BDPNAHXKPZJSAT9R', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBFR5S4RFQSC4J1RWXS', 'C.C-1236 Starter Set', 'opt_01M2JNFFB89SZ9JF61FW0MZREX', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBFZ750J5AYGDNWB8B3', 'TB-S30 Starter Set', 'opt_01M2JNFFB80DSQ7K6D7CWX4NPQ', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBF9VG8CEWPMD798X1V', 'IFC-137 Starter Set', 'opt_01M2JNFFB8WPXD0P0ZX0GP8347', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBFCTSZQABTF62K7CK9', 'GVK-00 50 Starter Set', 'opt_01M2JNFFB82BV2TM5V1938ANG1', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBF6FE55PZJJ63B3QS6', 'Melatonin II Starter Set', 'opt_01M2JNFFB80JRYWY6TY192WSKW', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBFAW1D923YATK8HRDN', 'Single Cartridge', 'opt_01M2JNFFB8P7YEE7MQSAHDF7MZ', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBG7BFDVK9V6RB5ETF1', 'Single Cartridge', 'opt_01M2JNFFB8FC6MRJSQ7Q2FWYZH', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBG1G0XHCSM599P9333', 'Single Cartridge', 'opt_01M2JNFFB89B1XK4YGWJ61QJ6R', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBGEA6FW95JANM58J56', 'Single Cartridge', 'opt_01M2JNFFB88EC7PDPYM5JFZ855', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBG6J808XXACV2Z1M0D', 'Single Cartridge', 'opt_01M2JNFFB9GDRBSE3672FTY02D', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBG5YS0BTE0N2CBDBXB', 'Single Cartridge', 'opt_01M2JNFFB915MP3QXXMC8AWZDV', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBGKVHWNNHPPM1HGDAY', '5 mg', 'opt_01M2JNFFB95JSSGQFRN5HH1HVA', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBH5K4M58B96N88GTGT', '10 mg', 'opt_01M2JNFFB9NHX4FR0B9HWHK7N1', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBHP1VAKBD7TQ31CAHD', '25 mg', 'opt_01M2JNFFB92TQ91HS7KGKCNTJF', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);
INSERT INTO "public"."product_option_value" ("id", "value", "option_id", "metadata", "created_at", "updated_at", "deleted_at", "rank") VALUES ('optval_01M2JNFFBH75S4SE4JZE1Y94XC', '50 mg', 'opt_01M2JNFFB9X8VAH5F7GAVNSRAM', NULL, '2026-09-15 19:53:05.908+06', '2026-09-15 19:53:05.908+06', NULL, NULL);


--
-- Data for Name: product_product_option; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPW8FHVASPSFCSEXJFJ', 'prod_01M2ATGAN90BGWA41FGYCFNY47', 'opt_01M2ATGANBC2V7J9KTHFYZ11WJ', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPW9CG5DD6XN776N55T', 'prod_01M2ATGANA192KFRCDZMG8B070', 'opt_01M2ATGANB1A8M6SRRZZ243FQJ', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPWQ9JG1HHFV1X79DFN', 'prod_01M2ATGANA0JDR8BY2GGR4VWPM', 'opt_01M2ATGANBCZA081QH07PJRYJF', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPW900T10BEZZJ1T9C7', 'prod_01M2ATGANAXZM8WKWA9BMZJ502', 'opt_01M2ATGANBT1NNFC93GS2R8WC1', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPX39J6095AY6X7HPHD', 'prod_01M2ATGANAVB31R7YTV0J72MBM', 'opt_01M2ATGANBV33105DQ2HGE7Q2B', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPX564XEQG54WX7X8MT', 'prod_01M2ATGANAM33CRP7W6CRQFY6W', 'opt_01M2ATGANBW32526D91FM1EMAA', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPXHEVWDNCG7XN7MEGQ', 'prod_01M2ATGANA2S8D747WKGY2K4VN', 'opt_01M2ATGANBKMYQK38KM696KBC2', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPXM0B9FEXZZV7HCVBX', 'prod_01M2ATGANANSNTR0JBS35RYPQE', 'opt_01M2ATGANBNKYPF0B7NYCPN6A9', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPXEY1MJFAZX0ZQ91RX', 'prod_01M2ATGANA2CZ6A72H3C8P64WX', 'opt_01M2ATGANB7AQNS2V1KQ712N1Y', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPXTTHR87JKCTP603QQ', 'prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', 'opt_01M2ATGANBRENYWQGMGW8FT3Y7', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPXR5R397PTPK6F6GRW', 'prod_01M2ATGANAT2FBEDSJZZA4Q6VA', 'opt_01M2ATGANBH12V4FN9WSN4TSAX', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPX6Q05ACMXFXY3GPS1', 'prod_01M2ATGANA0BXCDK40PQ9T83ZP', 'opt_01M2ATGANBYC7T9AJBA26J7XMA', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPX0XQSDF1ZWAX51SCA', 'prod_01M2ATGANAY8BPHXGHRB53JA3E', 'opt_01M2ATGANBPBWP2YCWDN40E5E3', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPX6EF6Y29QT8SS7VFH', 'prod_01M2ATGANA9QC2SPWE086NHCJE', 'opt_01M2ATGANBWE4GYSEN14YJRR9G', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPYSM305G2KXQ1YB5VC', 'prod_01M2ATGANAY86Z05WDTJFTW3DX', 'opt_01M2ATGANBHCS8RX7SF5Z4JP33', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPYKQF6XR1TR5QWNFYP', 'prod_01M2ATGANBXJKG5EERAKDBT0JY', 'opt_01M2ATGANC4KKQ3K1G3R1DWQJ0', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2ATGAPYJKX46QH1Y7X7GYXB', 'prod_01M2ATGANB2P5PSXH9QVCYE0DG', 'opt_01M2ATGANC4NMY838C5CCATE0V', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.719+06', '2026-09-15 19:53:05.713+06');
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCA07MNXZVNQTAAAAPC', 'prod_01M2JNFFB778WNCQARVRDBAKVB', 'opt_01M2JNFFB80393KF6WNPEKAJ04', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCAX1G9XA8WYDSV1WT3', 'prod_01M2JNFFB7M2HE0K6HSNC01HM3', 'opt_01M2JNFFB8BDPNAHXKPZJSAT9R', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCANF7K0YVM2WTQMY75', 'prod_01M2JNFFB7Z33KKW3RW4V9GM3B', 'opt_01M2JNFFB89SZ9JF61FW0MZREX', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBTEJTZV6A8RSDBM37', 'prod_01M2JNFFB7PXMJQVTA67B7G3Y7', 'opt_01M2JNFFB80DSQ7K6D7CWX4NPQ', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBDDGR75VC3C0FXNXC', 'prod_01M2JNFFB7NXMF3MP07YRVH1N5', 'opt_01M2JNFFB8WPXD0P0ZX0GP8347', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCB359NEVRW4TC61RB6', 'prod_01M2JNFFB78W2AM1HRRAVMK1EP', 'opt_01M2JNFFB82BV2TM5V1938ANG1', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBB88K6YM8D549PEY1', 'prod_01M2JNFFB719H38XS9QVG62Q49', 'opt_01M2JNFFB80JRYWY6TY192WSKW', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBQSY6S2BZX4R8D0ZZ', 'prod_01M2JNFFB7384WWNWAF45XZHCD', 'opt_01M2JNFFB8P7YEE7MQSAHDF7MZ', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBHPKV1F20KY0GC1SK', 'prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', 'opt_01M2JNFFB8FC6MRJSQ7Q2FWYZH', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBVEP4NB405KVZKWJK', 'prod_01M2JNFFB7FG04XZFBMCF9PG3R', 'opt_01M2JNFFB89B1XK4YGWJ61QJ6R', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCB11TCXZJNRV64G64P', 'prod_01M2JNFFB79A5833XBWG8ZVY74', 'opt_01M2JNFFB88EC7PDPYM5JFZ855', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCB885FA6D8P44Y5A68', 'prod_01M2JNFFB72RQGK2MPCF3H35MS', 'opt_01M2JNFFB9GDRBSE3672FTY02D', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCBZNTSZM1EMB8F11FB', 'prod_01M2JNFFB74H0D5GPKRVNXHDJY', 'opt_01M2JNFFB915MP3QXXMC8AWZDV', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCCHP21441NNY4E4B7A', 'prod_01M2JNFFB8Z235WPXZ2T3GRCMT', 'opt_01M2JNFFB95JSSGQFRN5HH1HVA', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCCZ5FF50CPTX3VEJM4', 'prod_01M2JNFFB8FV8CY4ZE47857C0M', 'opt_01M2JNFFB9NHX4FR0B9HWHK7N1', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCC3SYWNBSH9T44MD6Q', 'prod_01M2JNFFB8MTXS5VYCCMKHRSNH', 'opt_01M2JNFFB92TQ91HS7KGKCNTJF', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option" ("id", "product_id", "product_option_id", "created_at", "updated_at", "deleted_at") VALUES ('prodopt_01M2JNFFCCK8VYHDBB62G9BCX1', 'prod_01M2JNFFB8VYA43RGVYJW3SG50', 'opt_01M2JNFFB9X8VAH5F7GAVNSRAM', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);


--
-- Data for Name: product_product_option_value; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPYQ0F3TEBYCFCBT75Q', 'prodopt_01M2ATGAPW8FHVASPSFCSEXJFJ', 'optval_01M2ATGANHZWFQNGWRP62MSRT3', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZ0M277FF7TAKS9556', 'prodopt_01M2ATGAPW9CG5DD6XN776N55T', 'optval_01M2ATGANJAJPT1VA0Q7J617VA', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZE6DAP3ATCS0NPT45', 'prodopt_01M2ATGAPWQ9JG1HHFV1X79DFN', 'optval_01M2ATGANJN7SXDEC1EBCZB9EY', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZXTMM86VYDCXJ662S', 'prodopt_01M2ATGAPW900T10BEZZJ1T9C7', 'optval_01M2ATGANJRXEXBKA33QG823SF', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZYTSK919QC778FGVH', 'prodopt_01M2ATGAPX39J6095AY6X7HPHD', 'optval_01M2ATGANJBVASGV2JG0KDV5KC', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZNGX7K9GMZVX6YRB4', 'prodopt_01M2ATGAPX564XEQG54WX7X8MT', 'optval_01M2ATGANJP952XVC5DARM0ECP', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZ2V676Y5HNRHQ07DW', 'prodopt_01M2ATGAPXHEVWDNCG7XN7MEGQ', 'optval_01M2ATGANKJ7792MNBPM13K2CA', '2026-09-12 18:47:01.345+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZG897BPFQFRJEEJ7B', 'prodopt_01M2ATGAPXM0B9FEXZZV7HCVBX', 'optval_01M2ATGANKSH0Y6T25QKKD2F5E', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZA3TDJW56E7ADYSKE', 'prodopt_01M2ATGAPXEY1MJFAZX0ZQ91RX', 'optval_01M2ATGANKQGKHRVQXFG815TS2', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZBPAW3QAZHBE5MFB2', 'prodopt_01M2ATGAPXTTHR87JKCTP603QQ', 'optval_01M2ATGANKP1TZ09HE94W7ZE8T', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZ4HSM0FV0T2CVR5G6', 'prodopt_01M2ATGAPXR5R397PTPK6F6GRW', 'optval_01M2ATGANMFGQZXV9Q3Q1Q2ZHK', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAPZYCY684FXWDX58ADR', 'prodopt_01M2ATGAPX6Q05ACMXFXY3GPS1', 'optval_01M2ATGANMJ4EQ2BGCPRPR2S88', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAQ0Z29M5Z4WBVKCHKNS', 'prodopt_01M2ATGAPX0XQSDF1ZWAX51SCA', 'optval_01M2ATGANM13T20SW04XT803M6', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAQ0H2BG9BEG61X39SN5', 'prodopt_01M2ATGAPX6EF6Y29QT8SS7VFH', 'optval_01M2ATGANM9G8QM1YTESQTYNJG', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAQ0PENGT7X11E8KQZ7E', 'prodopt_01M2ATGAPYSM305G2KXQ1YB5VC', 'optval_01M2ATGANMFQ20RCQB7ZCC4MVK', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAQ0Z2MQAK3VNXNZQNWQ', 'prodopt_01M2ATGAPYKQF6XR1TR5QWNFYP', 'optval_01M2ATGANM7DDGZ4FWKJ49CT0H', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2ATGAQ0XF4CA84DP5ZGGQVG', 'prodopt_01M2ATGAPYJKX46QH1Y7X7GYXB', 'optval_01M2ATGANM8A8KXYHX6HA6SQQ7', '2026-09-12 18:47:01.346+06', '2026-09-15 19:53:05.718+06', '2026-09-15 19:53:05.708+06');
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCCQR2GAM2QMYS1ZP8K', 'prodopt_01M2JNFFCA07MNXZVNQTAAAAPC', 'optval_01M2JNFFBE4XN4E3GZEC05N8YC', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCCFT5G4MVA57FF4BDD', 'prodopt_01M2JNFFCAX1G9XA8WYDSV1WT3', 'optval_01M2JNFFBFRB0PNF69DN7E0G6T', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCD5Z4PSZWD8GWEQQ7P', 'prodopt_01M2JNFFCANF7K0YVM2WTQMY75', 'optval_01M2JNFFBFR5S4RFQSC4J1RWXS', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCD8RWE4KQPRRDE5717', 'prodopt_01M2JNFFCBTEJTZV6A8RSDBM37', 'optval_01M2JNFFBFZ750J5AYGDNWB8B3', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDMSKSRFHWZV3XAE2B', 'prodopt_01M2JNFFCBDDGR75VC3C0FXNXC', 'optval_01M2JNFFBF9VG8CEWPMD798X1V', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDHZG5B25JR67E3MP8', 'prodopt_01M2JNFFCB359NEVRW4TC61RB6', 'optval_01M2JNFFBFCTSZQABTF62K7CK9', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCD4D2MG2QDWSJA2X36', 'prodopt_01M2JNFFCBB88K6YM8D549PEY1', 'optval_01M2JNFFBF6FE55PZJJ63B3QS6', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDDWBH5R1YN3VB7A78', 'prodopt_01M2JNFFCBQSY6S2BZX4R8D0ZZ', 'optval_01M2JNFFBFAW1D923YATK8HRDN', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDSE8ASCMQ0XPE5EBG', 'prodopt_01M2JNFFCBHPKV1F20KY0GC1SK', 'optval_01M2JNFFBG7BFDVK9V6RB5ETF1', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDG542FAY08ZE06YNY', 'prodopt_01M2JNFFCBVEP4NB405KVZKWJK', 'optval_01M2JNFFBG1G0XHCSM599P9333', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCD309D6ETRZ1D2Z4SK', 'prodopt_01M2JNFFCB11TCXZJNRV64G64P', 'optval_01M2JNFFBGEA6FW95JANM58J56', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDHKSB42P45QBB2S61', 'prodopt_01M2JNFFCB885FA6D8P44Y5A68', 'optval_01M2JNFFBG6J808XXACV2Z1M0D', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCDHSCR2Z368MBM6K8B', 'prodopt_01M2JNFFCBZNTSZM1EMB8F11FB', 'optval_01M2JNFFBG5YS0BTE0N2CBDBXB', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCEG9QMT1GH38EDTZF0', 'prodopt_01M2JNFFCCHP21441NNY4E4B7A', 'optval_01M2JNFFBGKVHWNNHPPM1HGDAY', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCEDKXY2Y82MJ7KFWA4', 'prodopt_01M2JNFFCCZ5FF50CPTX3VEJM4', 'optval_01M2JNFFBH5K4M58B96N88GTGT', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCE08V01TV27KBA9J16', 'prodopt_01M2JNFFCC3SYWNBSH9T44MD6Q', 'optval_01M2JNFFBHP1VAKBD7TQ31CAHD', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);
INSERT INTO "public"."product_product_option_value" ("id", "product_product_option_id", "product_option_value_id", "created_at", "updated_at", "deleted_at") VALUES ('prodoptval_01M2JNFFCED155RFJB1VSH6YTT', 'prodopt_01M2JNFFCCK8VYHDBB62G9BCX1', 'optval_01M2JNFFBH75S4SE4JZE1Y94XC', '2026-09-15 19:53:05.935+06', '2026-09-15 19:53:05.935+06', NULL);


--
-- Data for Name: product_sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKS7E2H3YXJ6CM6233E', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2AQBJPRV8PHPTZB0CC56DM6', '2026-09-12 17:51:59.959934+06', '2026-09-12 18:46:44.674+06', '2026-09-12 18:46:44.673+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSGM3B6GR2PRJAXGNB', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2AQBJPR5Q9R5K4N6PSKTGZS', '2026-09-12 17:51:59.959934+06', '2026-09-12 18:46:44.674+06', '2026-09-12 18:46:44.673+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSN79P9XBVT4TM4VBT', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2AQBJPRH9VPWQD6B9WRV4Q6', '2026-09-12 17:51:59.959934+06', '2026-09-12 18:46:44.674+06', '2026-09-12 18:46:44.673+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSSGXF1ZPXKMDPVDBH', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2AQBJPS5K9MABWZZMH134F7', '2026-09-12 17:51:59.959934+06', '2026-09-12 18:46:44.674+06', '2026-09-12 18:46:44.673+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGAN90BGWA41FGYCFNY47', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASG80CY8CEAJTDJB0FF', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA0BXCDK40PQ9T83ZP', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASK5QNV0YMWWTJ7CM7R', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA0JDR8BY2GGR4VWPM', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASHRVMFP4KWF9M9M3Z6', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA192KFRCDZMG8B070', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASHXWEAEVNR5W0K0SDP', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA2CZ6A72H3C8P64WX', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASK3NJ050BAWTXT61FZ', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA2S8D747WKGY2K4VN', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASJJM8G5AY5KDJWA2XN', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA9QC2SPWE086NHCJE', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASKMCB45KW714DE3V2N', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASK87A44PG66SQXTJSR', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAM33CRP7W6CRQFY6W', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASJVCCWHR7DPDC9TAB5', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANANSNTR0JBS35RYPQE', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASJR8SJC6F58K19KY74', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAT2FBEDSJZZA4Q6VA', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASKZCYHH9FPT7VKNVNY', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAVB31R7YTV0J72MBM', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASJT0VKZ18NH5NYXKR5', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAXZM8WKWA9BMZJ502', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASJFP4SNG98J7CAYEB0', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAY86Z05WDTJFTW3DX', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASKKQKYHZW2NCT9XF8V', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAY8BPHXGHRB53JA3E', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASKZWT13T9T5MVWEQFV', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANB2P5PSXH9QVCYE0DG', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASME3SN8TMNZX5NTAQ4', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANBXJKG5EERAKDBT0JY', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2ATGASK96APS78AXV8M7H58', '2026-09-12 18:47:01.424034+06', '2026-09-15 19:53:05.374+06', '2026-09-15 19:53:05.373+06');
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB778WNCQARVRDBAKVB', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFE8J47Q2831FCC15Q3Y', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7M2HE0K6HSNC01HM3', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFE90C6XFK4WW0DNFZJ0', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7Z33KKW3RW4V9GM3B', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFE947ZYMHGWV35ANJQC', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7PXMJQVTA67B7G3Y7', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFE9691V7NQ77B30V3NJ', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7NXMF3MP07YRVH1N5', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEAJEBJ1CH150RZZ88Z', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB78W2AM1HRRAVMK1EP', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEAAN7FGYZ5YZYR1PB3', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB719H38XS9QVG62Q49', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEAM04BGWZVHBF8R5VJ', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7384WWNWAF45XZHCD', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEAGTKN8NFR0EA80EQ2', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEA0DFHBTJFS7PMY5P4', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7FG04XZFBMCF9PG3R', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEASV33V6T8F5VSZG9M', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB79A5833XBWG8ZVY74', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEA9RAANQX4N826VQNS', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB72RQGK2MPCF3H35MS', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEAW300VBX0DSCWHS60', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB74H0D5GPKRVNXHDJY', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEBB1RRN80GFGZXWSY9', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8Z235WPXZ2T3GRCMT', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEBPPZZW7VZWENMMQDG', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8FV8CY4ZE47857C0M', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEBE8ZXEHGH36MD8AW5', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8MTXS5VYCCMKHRSNH', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEBW05846YGT3FEP6EA', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);
INSERT INTO "public"."product_sales_channel" ("product_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8VYA43RGVYJW3SG50', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'prodsc_01M2JNFFEBNDZH8E024C9XZWWS', '2026-09-15 19:53:05.993185+06', '2026-09-15 19:53:05.993185+06', NULL);


--
-- Data for Name: product_shipping_profile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKS7E2H3YXJ6CM6233E', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2AQBJQ786ZYY9AKG2Y9CEB8', '2026-09-12 17:51:59.975532+06', '2026-09-12 18:46:44.676+06', '2026-09-12 18:46:44.676+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSGM3B6GR2PRJAXGNB', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2AQBJQ8Q5DG957WWZS5ZND8', '2026-09-12 17:51:59.975532+06', '2026-09-12 18:46:44.676+06', '2026-09-12 18:46:44.676+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSN79P9XBVT4TM4VBT', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2AQBJQ86CYYNT1BJGT2FFZE', '2026-09-12 17:51:59.975532+06', '2026-09-12 18:46:44.676+06', '2026-09-12 18:46:44.676+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2AQBJKSSGXF1ZPXKMDPVDBH', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2AQBJQ8JN9KWK06AC6VNXKK', '2026-09-12 17:51:59.975532+06', '2026-09-12 18:46:44.676+06', '2026-09-12 18:46:44.676+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGAN90BGWA41FGYCFNY47', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATCS1V99NA3YAMYK17X', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA0BXCDK40PQ9T83ZP', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATE96NXRPADKB5QBXZV', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA0JDR8BY2GGR4VWPM', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATDZMZNW720EDWTE9SW', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA192KFRCDZMG8B070', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATDPBDASPCEBH26RKPX', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA2CZ6A72H3C8P64WX', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATE81KD2CCS5NKV142D', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA2S8D747WKGY2K4VN', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATEDE0FQW4YJY7S6K0A', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANA9QC2SPWE086NHCJE', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATFM491QH6DHZ49FHTA', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATEHSDYYNQXFQH3XNGK', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAM33CRP7W6CRQFY6W', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATE8ZNXNFYR0K247XV5', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANANSNTR0JBS35RYPQE', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATEFEPJ6MH9C1YYTA93', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAT2FBEDSJZZA4Q6VA', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATEFMQSK6JKPGJXBX6V', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAVB31R7YTV0J72MBM', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATDFJY8YTDNADJW7WV2', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAXZM8WKWA9BMZJ502', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATDF0SG3S3TRFQZFMQD', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAY86Z05WDTJFTW3DX', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATFDCCCA6A0FW7HB7SC', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANAY8BPHXGHRB53JA3E', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATE9SD6JYBHY173VP3D', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANB2P5PSXH9QVCYE0DG', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATF6337S2ZGXX1TV3ZQ', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2ATGANBXJKG5EERAKDBT0JY', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2ATGATFW41CNWMK7FM70GH6', '2026-09-12 18:47:01.452669+06', '2026-09-15 19:53:05.378+06', '2026-09-15 19:53:05.377+06');
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB778WNCQARVRDBAKVB', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF1KPM0EWTZ8VN8NCJW', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7M2HE0K6HSNC01HM3', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF25QXJYMN4RKTG78QB', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7Z33KKW3RW4V9GM3B', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF22YJV0C2GVPXW056G', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7PXMJQVTA67B7G3Y7', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF2YQ3D6DZY59B2BX8K', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7NXMF3MP07YRVH1N5', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF24QBD71FWEAPX7HKB', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB78W2AM1HRRAVMK1EP', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF2DW6VK9T56VV7T7GH', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB719H38XS9QVG62Q49', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF2A9F0TV7CRHSRC0GH', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7384WWNWAF45XZHCD', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF2NHGZ6D93WSK2PVWQ', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3N343DD335M737C1Y', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB7FG04XZFBMCF9PG3R', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3ETWXXAPQPKFW9DGT', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB79A5833XBWG8ZVY74', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3XKKY694VRN18Z12D', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB72RQGK2MPCF3H35MS', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3PV9BZ9XXK236430E', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB74H0D5GPKRVNXHDJY', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3RZYAYFSMX8VX9PNW', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8Z235WPXZ2T3GRCMT', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3W1QX6WWCHAZQA6JX', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8FV8CY4ZE47857C0M', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3S76QS0J78KWEZZWS', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8MTXS5VYCCMKHRSNH', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3H9J7FH49HBZAN1Z6', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);
INSERT INTO "public"."product_shipping_profile" ("product_id", "shipping_profile_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('prod_01M2JNFFB8VYA43RGVYJW3SG50', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'prodsp_01M2JNFFF3TKY8P10WP6VPDBA6', '2026-09-15 19:53:06.018323+06', '2026-09-15 19:53:06.018323+06', NULL);


--
-- Data for Name: product_tag; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_type; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: product_variant; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVDFD6AFMHKM7H1MTA9', '10mg Complete Starter Set', 'PEN-RT-10', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGAN90BGWA41FGYCFNY47', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.391+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVDCECEZC0QZMGVV2AV', '15mg Complete Starter Set', 'PEN-TR-15', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA192KFRCDZMG8B070', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.402+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVD0JZ76K0H8218JT45', '10mg Complete Starter Set', 'PEN-SM-10', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA0JDR8BY2GGR4VWPM', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.41+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVDEBDGAF1RCC4SB2FB', '10mg Cartridge', 'REF-RT-10', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAXZM8WKWA9BMZJ502', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.42+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVE2BK2VDP8KWMQES72', '15mg Cartridge', 'REF-TR-15', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAVB31R7YTV0J72MBM', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.435+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVE1572SE9SRES6FW4C', '5mg Single Vial', 'VIA-RT-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAM33CRP7W6CRQFY6W', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.446+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVEVVTR9HWVGN6VSNRN', '10mg Single Vial', 'VIA-RT-10MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA2S8D747WKGY2K4VN', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.462+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVEK1FTWZMPT5EW0M3B', '5mg Single Vial', 'VIA-TR-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANANSNTR0JBS35RYPQE', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.479+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVEPRPV96SHG3GQE46Z', '10mg Single Vial', 'VIA-TR-10MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA2CZ6A72H3C8P64WX', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.493+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVF7EA3QDP84C07KKT7', '5mg Single Vial', 'VIA-SM-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANABKJ6EJ7QZ6HDNHYA', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.507+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVFM9XH0ZPTZS61TGN1', '10mg Single Vial', 'VIA-SM-10MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAT2FBEDSJZZA4Q6VA', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.52+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVF7ZAXP9FS8FAX672M', '50mg Single Vial', 'VIA-CU50-50MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA0BXCDK40PQ9T83ZP', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.536+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVFC9FBEFGDBXBR50V4', '100mg Single Vial', 'VIA-CU100-100MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAY8BPHXGHRB53JA3E', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.55+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVFYPQXS745WBARTA1K', '5mg Single Vial', 'VIA-BC5-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANA9QC2SPWE086NHCJE', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.564+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVG1N7QZ38DDVV7VRWS', '5mg Single Vial', 'VIA-TB5-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANAY86Z05WDTJFTW3DX', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.579+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVGNMN038701SJN5TR3', '500mg Single Vial', 'VIA-NJ500-500MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANBXJKG5EERAKDBT0JY', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.595+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2ATGAVGHCGJ6K8VC0V04XZM', '5mg Single Vial', 'VIA-CGL5-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2ATGANB2P5PSXH9QVCYE0DG', '2026-09-12 18:47:01.489+06', '2026-09-15 19:53:05.61+06', '2026-09-15 19:53:05.361+06', NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZ3F5T1W6Y950467S2', 'RT40 Starter Set', 'PEP-PEN-RT40', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7M2HE0K6HSNC01HM3', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZ9VRC4YR47GV4ZZ28', 'C.C-1236 Starter Set', 'PEP-PEN-CC1236', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7Z33KKW3RW4V9GM3B', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZT0VN7ASP6AS1701Q', 'TB-S30 Starter Set', 'PEP-PEN-TBS30', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7PXMJQVTA67B7G3Y7', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZ6ZTT3YS5R70A1KB9', 'IFC-137 Starter Set', 'PEP-PEN-IFC137', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7NXMF3MP07YRVH1N5', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZZP077S04W3THHNQZ', 'GVK-00 50 Starter Set', 'PEP-PEN-GVK0050', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB78W2AM1HRRAVMK1EP', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG0TAACZ95JGRX5J4VS', 'Melatonin II Starter Set', 'PEP-PEN-MELATONIN2', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB719H38XS9QVG62Q49', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG00K33J6F4KRV5GAT5', 'Single Cartridge', 'PEP-CRT-RT40', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7384WWNWAF45XZHCD', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG0B3XXVV424AR6PWJ4', 'Single Cartridge', 'PEP-CRT-CC1236', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7GETSZR8T1G3Q4J3Z', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG0MD7R31N38WHSY2Z5', 'Single Cartridge', 'PEP-CRT-TBS30', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB7FG04XZFBMCF9PG3R', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG0F41EMNHKY9XSJ157', 'Single Cartridge', 'PEP-CRT-IFC137', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB79A5833XBWG8ZVY74', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG17PRJE0QQHSJ2D6AM', 'Single Cartridge', 'PEP-CRT-GVK0050', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB72RQGK2MPCF3H35MS', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG1XTZ9CG2GM4SDN2VP', 'Single Cartridge', 'PEP-CRT-MELATONIN2', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB74H0D5GPKRVNXHDJY', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG100WZB7CE6RN0VFV6', '5 mg', 'PEP-VIA-5MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB8Z235WPXZ2T3GRCMT', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG114DZVQE931C4E1DD', '10 mg', 'PEP-VIA-10MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB8FV8CY4ZE47857C0M', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG1RKWWZV6PJM7EN7WN', '25 mg', 'PEP-VIA-25MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB8MTXS5VYCCMKHRSNH', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFG1D9GKDCGT6D6T76JF', '50 mg', 'PEP-VIA-50MG', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB8VYA43RGVYJW3SG50', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);
INSERT INTO "public"."product_variant" ("id", "title", "sku", "barcode", "ean", "upc", "allow_backorder", "manage_inventory", "hs_code", "origin_country", "mid_code", "material", "weight", "length", "height", "width", "metadata", "variant_rank", "product_id", "created_at", "updated_at", "deleted_at", "thumbnail") VALUES ('variant_01M2JNFFFZHCRTZ293CB958ZYM', 'Complete Starter Kit', 'PPS-1000', NULL, NULL, NULL, true, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 'prod_01M2JNFFB778WNCQARVRDBAKVB', '2026-09-15 19:53:06.05+06', '2026-09-15 19:53:06.05+06', NULL, NULL);


--
-- Data for Name: product_variant_inventory_item; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQX6XX2CJN01SSYC6TE', 'iitem_01M2AQBJS87EEXQ8BG92SQB8WN', 'pvitem_01M2AQBK0NHBAMZWCY42ETKC8V', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYQSPDSW0909N3S8VH', 'iitem_01M2AQBJS822CJ7EX9ERBBA1BR', 'pvitem_01M2AQBK0PQ75GC4VS2E1YFNAJ', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQY7E2R7GMG3J6NXJNB', 'iitem_01M2AQBJS89CVTKE4DSTZS77HG', 'pvitem_01M2AQBK0PQC2PV08T4WA4TFFQ', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYR3XMPDPY7Z5W5NTY', 'iitem_01M2AQBJS8G0BDKDD6SESYXGSM', 'pvitem_01M2AQBK0PYYYEDC8533CKE8S1', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYTDMHFHWC1PFYVWT6', 'iitem_01M2AQBJS8RNXP01KDXD8WT68H', 'pvitem_01M2AQBK0PYTNKTPX2VVJFZMRS', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYJDFEZR1YY0W1P1FX', 'iitem_01M2AQBJS9E3AQEMH9KFPE4VGZ', 'pvitem_01M2AQBK0PADWX3TH5NPJ6SJBS', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZEE920BKCFNQPNZ6X', 'iitem_01M2AQBJS9729MPTAK7S2MEYJ9', 'pvitem_01M2AQBK0PB6F9E884CF932XY8', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZMBAQCAGR6N7214X9', 'iitem_01M2AQBJS921PJ6JEG1Q0HTH5X', 'pvitem_01M2AQBK0QMZG2MYBJXD6PYHK1', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZCHE98QQYB5E29SEY', 'iitem_01M2AQBJS9MWPYBK3ZGWSEF5TM', 'pvitem_01M2AQBK0QX8C0FCD6JV5MG7CA', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZ3RJFMAG76735QX73', 'iitem_01M2AQBJS9FFMA7TR7DHSC8RSW', 'pvitem_01M2AQBK0QNPKE5T6QYJZ8V03Y', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZST7M23EV100WSB6G', 'iitem_01M2AQBJS99CVJP15S5JT99FNQ', 'pvitem_01M2AQBK0QWXXE8GFQ65EBM3S9', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZJH1PFY9EFN49GJTM', 'iitem_01M2AQBJS9BXYX9R92CHT2V79R', 'pvitem_01M2AQBK0QAZW1KX7JM29HZGH6', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.635+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR06S873T4ZH849WBNX', 'iitem_01M2AQBJSASQJKM3VBVP8HF4K9', 'pvitem_01M2AQBK0Q11Z1AVTY4S7G26J4', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0MV3WRZGBFQJPZ92A', 'iitem_01M2AQBJSAYDE6CJD9N481QAJD', 'pvitem_01M2AQBK0RSNTY4JZ2ZQRN6TVX', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR083HMPFTEY1EH072V', 'iitem_01M2AQBJSA1QXEN6WMTX2TEFZM', 'pvitem_01M2AQBK0RGWVTR74MWZ6GWMD0', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0PR3WT3MFYPWC2S6K', 'iitem_01M2AQBJSAW4E15TXBZWSWQFFS', 'pvitem_01M2AQBK0RW6S5NSCQG6D4QK01', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0GA4SK2M67DH90MPB', 'iitem_01M2AQBJSAETJ2NYTQ8EZ8AEXC', 'pvitem_01M2AQBK0RFB76DTM2GYHAY57V', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR04709FHPKKDPTFFSJ', 'iitem_01M2AQBJSAHYVC8WSWR4K00GTS', 'pvitem_01M2AQBK0RKH6VQ206WS4CZ9R2', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0ANRRDJ5WT67Q3513', 'iitem_01M2AQBJSA44SE4575HBKQ9DAJ', 'pvitem_01M2AQBK0R6NBW40KKRBNH9SMB', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR1X7C58BCEY2N758KV', 'iitem_01M2AQBJSA0APC29W5PMNS17PK', 'pvitem_01M2AQBK0R9K5NMMQV8326YSBH', 1, '2026-09-12 17:52:00.277059+06', '2026-09-12 18:46:44.636+06', '2026-09-12 18:46:44.634+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDFD6AFMHKM7H1MTA9', 'iitem_01M2ATGAWD7YNKJ269W0C8MBTP', 'pvitem_01M2ATGAX6TRJ2YR77M8H08XFP', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.337+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDCECEZC0QZMGVV2AV', 'iitem_01M2ATGAWDZ58Y8A30SYJTG2MP', 'pvitem_01M2ATGAX6EGGJ40VKWM31BZY5', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.337+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVD0JZ76K0H8218JT45', 'iitem_01M2ATGAWDA9XQEB04NGK3BP6G', 'pvitem_01M2ATGAX6WV0W29QZ1Q3NZQ7S', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDEBDGAF1RCC4SB2FB', 'iitem_01M2ATGAWD5D78NRAD6BCB529C', 'pvitem_01M2ATGAX758AYCXTPNMFF7225', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVE2BK2VDP8KWMQES72', 'iitem_01M2ATGAWD7AWMA6NNCPAPXGHC', 'pvitem_01M2ATGAX70S3FFYH1XZ07RVKC', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVE1572SE9SRES6FW4C', 'iitem_01M2ATGAWERZ26G7PZPA69VKG9', 'pvitem_01M2ATGAX7A3Y3XKP6QYHGY7R5', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEVVTR9HWVGN6VSNRN', 'iitem_01M2ATGAWEKP4EEGPK8FNC716K', 'pvitem_01M2ATGAX7JMCNJMAV75T6C7A9', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEK1FTWZMPT5EW0M3B', 'iitem_01M2ATGAWEFVPEJ3SRG6C1PZ6G', 'pvitem_01M2ATGAX7V3KXG1W4DR810FYQ', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEPRPV96SHG3GQE46Z', 'iitem_01M2ATGAWE6BVX5NRT3ES9SVJM', 'pvitem_01M2ATGAX7F8DF248XVG5FT4H2', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVF7EA3QDP84C07KKT7', 'iitem_01M2ATGAWE5M1D60GYQHN73P0M', 'pvitem_01M2ATGAX78ZBRM6WG35HQ3VEH', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFM9XH0ZPTZS61TGN1', 'iitem_01M2ATGAWE1C5WDKD89ERPDJXA', 'pvitem_01M2ATGAX82QZPT6EFF3ACDB6E', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVF7ZAXP9FS8FAX672M', 'iitem_01M2ATGAWEB2DJZNCXAESG5XND', 'pvitem_01M2ATGAX8VW5EWCV7H825TXXB', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFC9FBEFGDBXBR50V4', 'iitem_01M2ATGAWFNAXP121ZERD84ETH', 'pvitem_01M2ATGAX8B45TQXCNTKJWZ2C9', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFYPQXS745WBARTA1K', 'iitem_01M2ATGAWFQN9X1Z6YEJ5CHJQG', 'pvitem_01M2ATGAX8VK3MX1RJRQJ1ASJR', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVG1N7QZ38DDVV7VRWS', 'iitem_01M2ATGAWFW81R4WVTPBBR5YK4', 'pvitem_01M2ATGAX8E5AXWAABYHM9QJG9', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVGNMN038701SJN5TR3', 'iitem_01M2ATGAWFXMRQ070W3XGTMK3B', 'pvitem_01M2ATGAX8JCYJQRJ2WR9B778F', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVGHCGJ6K8VC0V04XZM', 'iitem_01M2ATGAWF9QWWZCV49X7JP2ZQ', 'pvitem_01M2ATGAX8MG3XKQVD19BC88X9', 1, '2026-09-12 18:47:01.542084+06', '2026-09-15 19:53:05.338+06', '2026-09-15 19:53:05.336+06');
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZHCRTZ293CB958ZYM', 'iitem_01M2JNFFH0HKK8FFC5QAB0NFGG', 'pvitem_01M2JNFFHQRX0QWKH2KXJHJMHZ', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ3F5T1W6Y950467S2', 'iitem_01M2JNFFH0A8YQWFCBBEMYKBSC', 'pvitem_01M2JNFFHRZ6KNS2KQA70THCK1', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ9VRC4YR47GV4ZZ28', 'iitem_01M2JNFFH0S9VE227KGRGCSDF2', 'pvitem_01M2JNFFHRM3VQ1J9AH89ZNKTH', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZT0VN7ASP6AS1701Q', 'iitem_01M2JNFFH0FXSDQQ4RGRE114CR', 'pvitem_01M2JNFFHRF736BVMASD13776W', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ6ZTT3YS5R70A1KB9', 'iitem_01M2JNFFH065PZX6BEY2MAY8H3', 'pvitem_01M2JNFFHRSG491X2WC9457YQP', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZZP077S04W3THHNQZ', 'iitem_01M2JNFFH0KADNB8KGW5WFQ2YQ', 'pvitem_01M2JNFFHRNG81JGGGNB89Q4FR', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0TAACZ95JGRX5J4VS', 'iitem_01M2JNFFH1PW60ZGMB5CQEJX4T', 'pvitem_01M2JNFFHR4M68YT81REY0YQAF', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG00K33J6F4KRV5GAT5', 'iitem_01M2JNFFH1J7HVRTNBSHKF0RWS', 'pvitem_01M2JNFFHSPDJXJJH8AE7EDHVK', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0B3XXVV424AR6PWJ4', 'iitem_01M2JNFFH1AT70AAG0XM176R5D', 'pvitem_01M2JNFFHSET1NHWZWZZMCX076', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0MD7R31N38WHSY2Z5', 'iitem_01M2JNFFH1ATQFCSA6V00T1XW2', 'pvitem_01M2JNFFHSTAYNVGGKVFRTXGX2', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0F41EMNHKY9XSJ157', 'iitem_01M2JNFFH15FKJRNG6S7STG4JV', 'pvitem_01M2JNFFHSYV5ZDAQ9QV3SPW67', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG17PRJE0QQHSJ2D6AM', 'iitem_01M2JNFFH194WHRFMTCJ0DHKQ5', 'pvitem_01M2JNFFHS1MJRH5WWHWBJ3JP3', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1XTZ9CG2GM4SDN2VP', 'iitem_01M2JNFFH1BRNC7PD4HKDSQBD0', 'pvitem_01M2JNFFHTEXBYXJW0Y4AXMS0F', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG100WZB7CE6RN0VFV6', 'iitem_01M2JNFFH2XTMRXMFJ2BGNWQQJ', 'pvitem_01M2JNFFHT9371TJ3Z6XDTQGRC', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG114DZVQE931C4E1DD', 'iitem_01M2JNFFH24SWFK7JAT0JQ6RH1', 'pvitem_01M2JNFFHTA4XA9X7SG28323V4', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1RKWWZV6PJM7EN7WN', 'iitem_01M2JNFFH27A5P8R644XSENJBJ', 'pvitem_01M2JNFFHTJQZ2X6B1M1TG01T4', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);
INSERT INTO "public"."product_variant_inventory_item" ("variant_id", "inventory_item_id", "id", "required_quantity", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1D9GKDCGT6D6T76JF', 'iitem_01M2JNFFH29TNSCSGD483Q6HY5', 'pvitem_01M2JNFFHVM89X8Q1BD1BM4WAM', 1, '2026-09-15 19:53:06.104288+06', '2026-09-15 19:53:06.104288+06', NULL);


--
-- Data for Name: product_variant_option; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVDFD6AFMHKM7H1MTA9', 'optval_01M2ATGANHZWFQNGWRP62MSRT3');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVDCECEZC0QZMGVV2AV', 'optval_01M2ATGANJAJPT1VA0Q7J617VA');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVD0JZ76K0H8218JT45', 'optval_01M2ATGANJN7SXDEC1EBCZB9EY');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVDEBDGAF1RCC4SB2FB', 'optval_01M2ATGANJRXEXBKA33QG823SF');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVE2BK2VDP8KWMQES72', 'optval_01M2ATGANJBVASGV2JG0KDV5KC');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVE1572SE9SRES6FW4C', 'optval_01M2ATGANJP952XVC5DARM0ECP');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVEVVTR9HWVGN6VSNRN', 'optval_01M2ATGANKJ7792MNBPM13K2CA');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVEK1FTWZMPT5EW0M3B', 'optval_01M2ATGANKSH0Y6T25QKKD2F5E');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVEPRPV96SHG3GQE46Z', 'optval_01M2ATGANKQGKHRVQXFG815TS2');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVF7EA3QDP84C07KKT7', 'optval_01M2ATGANKP1TZ09HE94W7ZE8T');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVFM9XH0ZPTZS61TGN1', 'optval_01M2ATGANMFGQZXV9Q3Q1Q2ZHK');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVF7ZAXP9FS8FAX672M', 'optval_01M2ATGANMJ4EQ2BGCPRPR2S88');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVFC9FBEFGDBXBR50V4', 'optval_01M2ATGANM13T20SW04XT803M6');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVFYPQXS745WBARTA1K', 'optval_01M2ATGANM9G8QM1YTESQTYNJG');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVG1N7QZ38DDVV7VRWS', 'optval_01M2ATGANMFQ20RCQB7ZCC4MVK');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVGNMN038701SJN5TR3', 'optval_01M2ATGANM7DDGZ4FWKJ49CT0H');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2ATGAVGHCGJ6K8VC0V04XZM', 'optval_01M2ATGANM8A8KXYHX6HA6SQQ7');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZHCRTZ293CB958ZYM', 'optval_01M2JNFFBE4XN4E3GZEC05N8YC');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZ3F5T1W6Y950467S2', 'optval_01M2JNFFBFRB0PNF69DN7E0G6T');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZ9VRC4YR47GV4ZZ28', 'optval_01M2JNFFBFR5S4RFQSC4J1RWXS');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZT0VN7ASP6AS1701Q', 'optval_01M2JNFFBFZ750J5AYGDNWB8B3');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZ6ZTT3YS5R70A1KB9', 'optval_01M2JNFFBF9VG8CEWPMD798X1V');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFFZZP077S04W3THHNQZ', 'optval_01M2JNFFBFCTSZQABTF62K7CK9');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG0TAACZ95JGRX5J4VS', 'optval_01M2JNFFBF6FE55PZJJ63B3QS6');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG00K33J6F4KRV5GAT5', 'optval_01M2JNFFBFAW1D923YATK8HRDN');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG0B3XXVV424AR6PWJ4', 'optval_01M2JNFFBG7BFDVK9V6RB5ETF1');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG0MD7R31N38WHSY2Z5', 'optval_01M2JNFFBG1G0XHCSM599P9333');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG0F41EMNHKY9XSJ157', 'optval_01M2JNFFBGEA6FW95JANM58J56');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG17PRJE0QQHSJ2D6AM', 'optval_01M2JNFFBG6J808XXACV2Z1M0D');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG1XTZ9CG2GM4SDN2VP', 'optval_01M2JNFFBG5YS0BTE0N2CBDBXB');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG100WZB7CE6RN0VFV6', 'optval_01M2JNFFBGKVHWNNHPPM1HGDAY');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG114DZVQE931C4E1DD', 'optval_01M2JNFFBH5K4M58B96N88GTGT');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG1RKWWZV6PJM7EN7WN', 'optval_01M2JNFFBHP1VAKBD7TQ31CAHD');
INSERT INTO "public"."product_variant_option" ("variant_id", "option_value_id") VALUES ('variant_01M2JNFFG1D9GKDCGT6D6T76JF', 'optval_01M2JNFFBH75S4SE4JZE1Y94XC');


--
-- Data for Name: product_variant_price_set; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQX6XX2CJN01SSYC6TE', 'pset_01M2AQBK1GG7PHCXX05BQTHEB1', 'pvps_01M2AQBK4VDZRN3MT9EXPSQD8V', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.67+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYQSPDSW0909N3S8VH', 'pset_01M2AQBK1GCWPHD2M7GNPV7007', 'pvps_01M2AQBK4WC5J6KKPKXG2JYNW8', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQY7E2R7GMG3J6NXJNB', 'pset_01M2AQBK1HV4QABXJME4XDSG4D', 'pvps_01M2AQBK4WMP532X1VKPENMSCA', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYR3XMPDPY7Z5W5NTY', 'pset_01M2AQBK1HQ1D3BV9W6WTT3QZV', 'pvps_01M2AQBK4WMJYEEA08Z642CZT5', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYTDMHFHWC1PFYVWT6', 'pset_01M2AQBK1H62RVKTGNB9853X5G', 'pvps_01M2AQBK4WZG6C684MSTSG2VW9', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQYJDFEZR1YY0W1P1FX', 'pset_01M2AQBK1JX3A7MX15VM1KBCD8', 'pvps_01M2AQBK4XYX2JRF5QCNN2C23E', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZEE920BKCFNQPNZ6X', 'pset_01M2AQBK1JQZ1GVEDKN690K2CE', 'pvps_01M2AQBK4X02B29299APB0QJ69', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZMBAQCAGR6N7214X9', 'pset_01M2AQBK1JJR2WW9Q01VK25DZV', 'pvps_01M2AQBK4X2MG9VYBGHPZKC5T1', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZCHE98QQYB5E29SEY', 'pset_01M2AQBK1KX50JB3AYFV1ZT6A1', 'pvps_01M2AQBK4XY7DTDDBZNXTGXGK7', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZ3RJFMAG76735QX73', 'pset_01M2AQBK1KTPSFD2KZG138JTWB', 'pvps_01M2AQBK4XHF133X8EWRWH7E60', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZST7M23EV100WSB6G', 'pset_01M2AQBK1K4CMG0KZN510HZG6M', 'pvps_01M2AQBK4XN4SDBDXS5WYK1SMN', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJQZJH1PFY9EFN49GJTM', 'pset_01M2AQBK1MCVBBR5MQ0VDMMQCS', 'pvps_01M2AQBK4XXH8250HVQ3M92YE8', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR06S873T4ZH849WBNX', 'pset_01M2AQBK1MKASBGZE9SP9VKNWD', 'pvps_01M2AQBK4XMC01ESB6HJGR84RH', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0MV3WRZGBFQJPZ92A', 'pset_01M2AQBK1MKHK4KRXWSP2K79AJ', 'pvps_01M2AQBK4XW30DT43ZZ62NTFB0', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR083HMPFTEY1EH072V', 'pset_01M2AQBK1NVK4ZPPSDT08WMNE8', 'pvps_01M2AQBK4YC0C3VHYPRC5C5HQW', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0PR3WT3MFYPWC2S6K', 'pset_01M2AQBK1NZV1ZYY0MNZX8BBW1', 'pvps_01M2AQBK4YW4Y36SJKT4025QEP', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0GA4SK2M67DH90MPB', 'pset_01M2AQBK1NGGGVY8SYRWBWCWTH', 'pvps_01M2AQBK4YP4G0PZXJ561Q1K25', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR04709FHPKKDPTFFSJ', 'pset_01M2AQBK1PEHJTJVDZRQ08DJKE', 'pvps_01M2AQBK4YHJ1RGG00C42VZDZ4', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR0ANRRDJ5WT67Q3513', 'pset_01M2AQBK1PKZMP4WV0BG2JKTA2', 'pvps_01M2AQBK4Y3NX755X9G473CWBR', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2AQBJR1X7C58BCEY2N758KV', 'pset_01M2AQBK1PYT361RME8Y6RPDYS', 'pvps_01M2AQBK4YG681KG8EYG8W1M1A', '2026-09-12 17:52:00.41134+06', '2026-09-12 18:46:44.671+06', '2026-09-12 18:46:44.669+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDFD6AFMHKM7H1MTA9', 'pset_01M2ATGAXRAPEKK2YS6HBCF70H', 'pvps_01M2ATGAZYTM2E0YM0DQ9ZCCP7', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDCECEZC0QZMGVV2AV', 'pset_01M2ATGAXR4P8NFFC1ZTE8QZZY', 'pvps_01M2ATGAZZEEB9W6935MC1P0VN', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVD0JZ76K0H8218JT45', 'pset_01M2ATGAXSSM6MJ5XAP1PS6NYW', 'pvps_01M2ATGAZZPD7EYHEP296ZQ0EP', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVDEBDGAF1RCC4SB2FB', 'pset_01M2ATGAXSX7101VAGEPEA800P', 'pvps_01M2ATGAZZYP7HDVWA194AY0BE', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVE2BK2VDP8KWMQES72', 'pset_01M2ATGAXT6Z8P07392P3M49GT', 'pvps_01M2ATGAZZYFRS1Z2CRRHF26EP', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVE1572SE9SRES6FW4C', 'pset_01M2ATGAXT3EQNCMT0T7SJ68B1', 'pvps_01M2ATGAZZJJ78VBS7W6HXXWMN', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEVVTR9HWVGN6VSNRN', 'pset_01M2ATGAXV330JQR1C9FYSVD0N', 'pvps_01M2ATGAZZQ76MXJ7NZHPSMFFH', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEK1FTWZMPT5EW0M3B', 'pset_01M2ATGAXVF50798VQDA95Z9HT', 'pvps_01M2ATGB00Y2VGDGKRZEGVBMBW', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVEPRPV96SHG3GQE46Z', 'pset_01M2ATGAXWAAC8Q62AQHQS2SE7', 'pvps_01M2ATGB005BXJZ1NZ1MFFHF6W', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVF7EA3QDP84C07KKT7', 'pset_01M2ATGAXWFAXQ7SZD88BV791V', 'pvps_01M2ATGB00ZH2NCK7WMAHE0692', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFM9XH0ZPTZS61TGN1', 'pset_01M2ATGAXXGXY42YZ2JB95HSGP', 'pvps_01M2ATGB00X4HR34EGNHAH3F72', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVF7ZAXP9FS8FAX672M', 'pset_01M2ATGAXXA6KJ1EPK4KQNWXC2', 'pvps_01M2ATGB00225BBSK7DWCK8NSY', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFC9FBEFGDBXBR50V4', 'pset_01M2ATGAXYYSQSKPXR43HNKY1H', 'pvps_01M2ATGB00H9JKNH0X4GX8MWMG', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVFYPQXS745WBARTA1K', 'pset_01M2ATGAXYHAVPM7E2GDEX9Y2T', 'pvps_01M2ATGB00ZYXA8Y1QW4EG5PSK', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVG1N7QZ38DDVV7VRWS', 'pset_01M2ATGAXZ0H5PQ69XZYKCNAXT', 'pvps_01M2ATGB01V6YFC2CSQXZHV1DV', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVGNMN038701SJN5TR3', 'pset_01M2ATGAXZTHX72TD0F26S2J8Y', 'pvps_01M2ATGB01HC67HV4ABM1YGQ3A', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2ATGAVGHCGJ6K8VC0V04XZM', 'pset_01M2ATGAY03K5MCZRRFDRXQ673', 'pvps_01M2ATGB011J7EXVWENV6NTQMS', '2026-09-12 18:47:01.630447+06', '2026-09-15 19:53:05.369+06', '2026-09-15 19:53:05.368+06');
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZHCRTZ293CB958ZYM', 'pset_01M2JNFFJFQBTS4ENV6TQRT3J0', 'pvps_01M2JNFFKPMWZADWEXZW4M5W6B', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ3F5T1W6Y950467S2', 'pset_01M2JNFFJFJ0F8YE84B2WPNH60', 'pvps_01M2JNFFKP2APT6GV6HGKKW7P1', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ9VRC4YR47GV4ZZ28', 'pset_01M2JNFFJFV9BHXKVVX5ZRD8H4', 'pvps_01M2JNFFKP8A4KM0DBXRPY3VAM', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZT0VN7ASP6AS1701Q', 'pset_01M2JNFFJGASP8ZH6SE6XY57ZY', 'pvps_01M2JNFFKQ20YMSS7XKMXSHJA8', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZ6ZTT3YS5R70A1KB9', 'pset_01M2JNFFJGFWK25VR6WG1NS7RY', 'pvps_01M2JNFFKQWQ53Z1EAFBM6CAB1', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFFZZP077S04W3THHNQZ', 'pset_01M2JNFFJG2Y5ZWXFR89G0YAVB', 'pvps_01M2JNFFKQY2YEJHE6M9DD8B6E', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0TAACZ95JGRX5J4VS', 'pset_01M2JNFFJHJ3JCH86K4AVT8TKB', 'pvps_01M2JNFFKQQG64FQSGBEVWBD52', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG00K33J6F4KRV5GAT5', 'pset_01M2JNFFJH3X20V8R5M6J5BR2F', 'pvps_01M2JNFFKQWP244A1VZ7F6YDZY', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0B3XXVV424AR6PWJ4', 'pset_01M2JNFFJH30WKDGGQJS206GB2', 'pvps_01M2JNFFKQM9GCTQZA5NB9E3DM', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0MD7R31N38WHSY2Z5', 'pset_01M2JNFFJJVSKMG23NFXM5B2P0', 'pvps_01M2JNFFKQVM4GC3460NXENDAK', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG0F41EMNHKY9XSJ157', 'pset_01M2JNFFJJ5PFDFSR9NFKE6RY1', 'pvps_01M2JNFFKR0FE25QVHDN8H0HHS', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG17PRJE0QQHSJ2D6AM', 'pset_01M2JNFFJJWA083QTZYM0QC2KN', 'pvps_01M2JNFFKRYYC3JYMF43FWEDTA', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1XTZ9CG2GM4SDN2VP', 'pset_01M2JNFFJKA70E31A9RX4C05Y2', 'pvps_01M2JNFFKRJ9ZJXHBSG0E7XRMZ', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG100WZB7CE6RN0VFV6', 'pset_01M2JNFFJKKJGZ2CAS2ZE1H94T', 'pvps_01M2JNFFKRHBB337J1JK5G9G2Z', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG114DZVQE931C4E1DD', 'pset_01M2JNFFJKPEVXN8JZ8G97Z4TP', 'pvps_01M2JNFFKR5Y8DDK4Y6BW3ZX3S', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1RKWWZV6PJM7EN7WN', 'pset_01M2JNFFJKS5PTA7HQ5PTAMNQ6', 'pvps_01M2JNFFKR5VWC8R00YSZ1ZZCA', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);
INSERT INTO "public"."product_variant_price_set" ("variant_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('variant_01M2JNFFG1D9GKDCGT6D6T76JF', 'pset_01M2JNFFJMJSYYVW8CNFK9Y2ES', 'pvps_01M2JNFFKRNADAADQP68HGKG2J', '2026-09-15 19:53:06.166983+06', '2026-09-15 19:53:06.166983+06', NULL);


--
-- Data for Name: product_variant_product_image; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_application_method; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_campaign; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_campaign_budget; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_campaign_budget_usage; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_promotion_rule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_rule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: promotion_rule_value; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: property_label; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: provider_identity; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2AQBY6NV0HBF24ATAGF7335', 'admin@peptech.bio', 'emailpass', 'authid_01M2AQBY6P6PMNRRV6XXKY6MCC', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAeyWKfs7Zkidfq9JHCt2MrNgS8gF1HW5BwW8TTe/p7jT0VyaeuB6syfUZ9Z5j5EQMDNm0okLOdVj8+KHnW0Wr7Ujk2+177pdpTvzK+yA5udm"}', '2026-09-12 17:52:11.735+06', '2026-09-12 17:52:11.735+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2TV9NFXHYG5NJ7R1BTWBVS9', 'alexander.wright@cambridge-biotech.ac.uk', 'emailpass', 'authid_01M2TV9NFZRWQ7DP7VJDY5BZ4N', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAASUvKNUZb+MMw3urhgmZxEpmnVVXaPdpCwDLXRxdn/PHQyKxcntntmimRsg3bB5o5Lv5MGClluA4xryy04kVWfZggkP3AqsAGPrHaXb/3aCD"}', '2026-09-19 00:08:42.498+06', '2026-09-19 00:08:42.498+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2TVE4MAZW2Y6E23VC5YDPFP', 'test.researcher.1789755068860@cambridge.ac.uk', 'emailpass', 'authid_01M2TVE4MAQ67MFWB177DJBVK7', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAXJKL5oNFE1RlwD4JijUUQIl3RmMQopavShSarEN+ST6Bj/oLV2i4MVRGDDrg7o8WwhVisA7w01y1RPnXtr9DOkSk/2X9qvPy6V8nvxOlDTA"}', '2026-09-19 00:11:09.066+06', '2026-09-19 00:11:09.066+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2TVRHQ9B07PKNTG7K64CQJ8', 'dr.vance.9981@imperial-genomics.ac.uk', 'emailpass', 'authid_01M2TVRHQ95Y6JV1W7BE771YM8', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAZz0lOOv9/OIk1JXYroCbq3ZFP2SVuX/x9wacG3IkTXreY5FNblUSp5Mzg31zYRp+Q0Nb2lP2orq2y1lOSGy1ix9cxJhv9F5DpBO+QacrrRU"}', '2026-09-19 00:16:50.154+06', '2026-09-19 00:16:50.154+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2WKTMW5CHVBWDT4WFXDZWBP', 'test.researcher.1789814198929@cambridge.ac.uk', 'emailpass', 'authid_01M2WKTMW654D8Y7XNTZN6GM18', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAdRSLrtU8nR2EA2vryk//c+awan/SlJKYqLNUEAPfgcZMEU5DWWPdz91s6aB3vhUdz0E2amVVG0Cac06Km2diU9hJjz10Ls7kxUHT+ad7tIw"}', '2026-09-19 16:36:39.177+06', '2026-09-19 16:36:39.177+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2WKVW7834TMHG2KKVBVHBR4', 'prof.marcus.1789814239257@oxford.ac.uk', 'emailpass', 'authid_01M2WKVW79JEAA2HNHPRDPHJG9', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAARAKR6fZ/6ldWxOkxE/PsJ7OCDbSQjOuU/rtFrIB7p/e9fCoAooqWpyt30Mhmam+ZLEfodZwP5lhQrVNsIKghToSSmIhwqcYnR2YBohtXbq1"}', '2026-09-19 16:37:19.465+06', '2026-09-19 16:37:19.465+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2WM0C49S8HBQVQW6C7ANF79', 'dr.clara.1789814386628@oxford-genomics.ac.uk', 'emailpass', 'authid_01M2WM0C49C0QPGEXPC0HM32DE', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAey4wdY5zuMPbQBMaPplf5DNNzWHRDCE0F9sBNol0h4eRpKAHrVjk6grtkwHB6W8ypuepTjIMhIC6izUGwCCca9vdJE/id6uLpCBNfyxMRsf"}', '2026-09-19 16:39:46.826+06', '2026-09-19 16:39:46.826+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2ZPTKV2159SXMJPH71S4C54', 'yasinarafat6184@gmail.com', 'emailpass', 'authid_01M2ZPTKV3CKKGMZ9CPFP092SG', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAaqRV3IK6PYnuTyDT2dr3jjVHeRwnQbMtE/eljDYWrcZGJ0i8fPkytQ8iwhfaqGoBUThHenmooqmPxzzDegttpODAr9PO2zFbbNYxfG6CbYE"}', '2026-09-20 21:26:47.139+06', '2026-09-20 21:26:47.139+06', NULL);
INSERT INTO "public"."provider_identity" ("id", "entity_id", "provider", "auth_identity_id", "user_metadata", "provider_metadata", "created_at", "updated_at", "deleted_at") VALUES ('01M2ZQDD0KAVN1PXEY7DSRXY3J', 'testcustomer123@peptech.bio', 'emailpass', 'authid_01M2ZQDD0KM2EC15NBW8YZS6T0', NULL, '{"password": "c2NyeXB0AA8AAAAIAAAAAWAIES3sHySw1YKgm6JVF5RPRf3M3Bpd65awcv8P/mBzgVwZlFqvZ2vRf5a4VkhlYfAE4t+QDXXV0TOlx7HK9MRG8bFWkB6JixiuKQZeOCwT"}', '2026-09-20 21:37:02.74+06', '2026-09-20 21:37:02.74+06', NULL);


--
-- Data for Name: publishable_api_key_sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."publishable_api_key_sales_channel" ("publishable_key_id", "sales_channel_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('apk_01M2AQBJ72Q80GXWWT6PAW5741', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'pksc_01M2AQBJ7P72F4RS04WPB85EKN', '2026-09-12 17:51:59.477782+06', '2026-09-12 17:51:59.477782+06', NULL);


--
-- Data for Name: refund; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: refund_reason; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."refund_reason" ("id", "label", "description", "metadata", "created_at", "updated_at", "deleted_at", "code") VALUES ('refr_01M2AQAMJ9PDD57Q3BBABVEEJP', 'Shipping Issue', 'Refund due to lost, delayed, or misdelivered shipment', NULL, '2026-09-12 17:51:28.678234+06', '2026-09-12 17:51:28.678234+06', NULL, 'shipping_issue');
INSERT INTO "public"."refund_reason" ("id", "label", "description", "metadata", "created_at", "updated_at", "deleted_at", "code") VALUES ('refr_01M2AQAMJARXW6AZ2K3TDN692M', 'Customer Care Adjustment', 'Refund given as goodwill or compensation for inconvenience', NULL, '2026-09-12 17:51:28.678234+06', '2026-09-12 17:51:28.678234+06', NULL, 'customer_care_adjustment');
INSERT INTO "public"."refund_reason" ("id", "label", "description", "metadata", "created_at", "updated_at", "deleted_at", "code") VALUES ('refr_01M2AQAMJAMDF2SKJ0CS89QWHM', 'Pricing Error', 'Refund to correct an overcharge, missing discount, or incorrect price', NULL, '2026-09-12 17:51:28.678234+06', '2026-09-12 17:51:28.678234+06', NULL, 'pricing_error');


--
-- Data for Name: region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."region" ("id", "name", "currency_code", "metadata", "created_at", "updated_at", "deleted_at", "automatic_taxes") VALUES ('reg_01M2AQBJ9A89RTYJDP98PH1R6X', 'United Kingdom & Europe', 'gbp', NULL, '2026-09-12 17:51:59.541+06', '2026-09-12 17:51:59.542+06', NULL, true);


--
-- Data for Name: region_country; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('af', 'afg', '004', 'AFGHANISTAN', 'Afghanistan', NULL, NULL, '2026-09-12 17:51:39.84+06', '2026-09-12 17:51:39.84+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('al', 'alb', '008', 'ALBANIA', 'Albania', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('dz', 'dza', '012', 'ALGERIA', 'Algeria', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('as', 'asm', '016', 'AMERICAN SAMOA', 'American Samoa', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ad', 'and', '020', 'ANDORRA', 'Andorra', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ao', 'ago', '024', 'ANGOLA', 'Angola', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ai', 'aia', '660', 'ANGUILLA', 'Anguilla', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('aq', 'ata', '010', 'ANTARCTICA', 'Antarctica', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ag', 'atg', '028', 'ANTIGUA AND BARBUDA', 'Antigua and Barbuda', NULL, NULL, '2026-09-12 17:51:39.844+06', '2026-09-12 17:51:39.844+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ar', 'arg', '032', 'ARGENTINA', 'Argentina', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('am', 'arm', '051', 'ARMENIA', 'Armenia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('aw', 'abw', '533', 'ARUBA', 'Aruba', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('au', 'aus', '036', 'AUSTRALIA', 'Australia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('at', 'aut', '040', 'AUSTRIA', 'Austria', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('az', 'aze', '031', 'AZERBAIJAN', 'Azerbaijan', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bs', 'bhs', '044', 'BAHAMAS', 'Bahamas', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bh', 'bhr', '048', 'BAHRAIN', 'Bahrain', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bd', 'bgd', '050', 'BANGLADESH', 'Bangladesh', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bb', 'brb', '052', 'BARBADOS', 'Barbados', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('by', 'blr', '112', 'BELARUS', 'Belarus', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('be', 'bel', '056', 'BELGIUM', 'Belgium', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bz', 'blz', '084', 'BELIZE', 'Belize', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bj', 'ben', '204', 'BENIN', 'Benin', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bm', 'bmu', '060', 'BERMUDA', 'Bermuda', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bt', 'btn', '064', 'BHUTAN', 'Bhutan', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bo', 'bol', '068', 'BOLIVIA', 'Bolivia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bq', 'bes', '535', 'BONAIRE, SINT EUSTATIUS AND SABA', 'Bonaire, Sint Eustatius and Saba', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ba', 'bih', '070', 'BOSNIA AND HERZEGOVINA', 'Bosnia and Herzegovina', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bw', 'bwa', '072', 'BOTSWANA', 'Botswana', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bv', 'bvd', '074', 'BOUVET ISLAND', 'Bouvet Island', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('br', 'bra', '076', 'BRAZIL', 'Brazil', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('io', 'iot', '086', 'BRITISH INDIAN OCEAN TERRITORY', 'British Indian Ocean Territory', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bn', 'brn', '096', 'BRUNEI DARUSSALAM', 'Brunei Darussalam', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bg', 'bgr', '100', 'BULGARIA', 'Bulgaria', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bf', 'bfa', '854', 'BURKINA FASO', 'Burkina Faso', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bi', 'bdi', '108', 'BURUNDI', 'Burundi', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kh', 'khm', '116', 'CAMBODIA', 'Cambodia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cm', 'cmr', '120', 'CAMEROON', 'Cameroon', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ca', 'can', '124', 'CANADA', 'Canada', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cv', 'cpv', '132', 'CAPE VERDE', 'Cape Verde', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ky', 'cym', '136', 'CAYMAN ISLANDS', 'Cayman Islands', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cf', 'caf', '140', 'CENTRAL AFRICAN REPUBLIC', 'Central African Republic', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('td', 'tcd', '148', 'CHAD', 'Chad', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cl', 'chl', '152', 'CHILE', 'Chile', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cn', 'chn', '156', 'CHINA', 'China', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cx', 'cxr', '162', 'CHRISTMAS ISLAND', 'Christmas Island', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cc', 'cck', '166', 'COCOS (KEELING) ISLANDS', 'Cocos (Keeling) Islands', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('co', 'col', '170', 'COLOMBIA', 'Colombia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('km', 'com', '174', 'COMOROS', 'Comoros', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cg', 'cog', '178', 'CONGO', 'Congo', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cd', 'cod', '180', 'CONGO, THE DEMOCRATIC REPUBLIC OF THE', 'Congo, the Democratic Republic of the', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ck', 'cok', '184', 'COOK ISLANDS', 'Cook Islands', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cr', 'cri', '188', 'COSTA RICA', 'Costa Rica', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ci', 'civ', '384', 'COTE D''IVOIRE', 'Cote D''Ivoire', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('hr', 'hrv', '191', 'CROATIA', 'Croatia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cu', 'cub', '192', 'CUBA', 'Cuba', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cw', 'cuw', '531', 'CURAÇAO', 'Curaçao', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cy', 'cyp', '196', 'CYPRUS', 'Cyprus', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('cz', 'cze', '203', 'CZECH REPUBLIC', 'Czech Republic', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('dj', 'dji', '262', 'DJIBOUTI', 'Djibouti', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('dm', 'dma', '212', 'DOMINICA', 'Dominica', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('do', 'dom', '214', 'DOMINICAN REPUBLIC', 'Dominican Republic', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ec', 'ecu', '218', 'ECUADOR', 'Ecuador', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('eg', 'egy', '818', 'EGYPT', 'Egypt', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sv', 'slv', '222', 'EL SALVADOR', 'El Salvador', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gq', 'gnq', '226', 'EQUATORIAL GUINEA', 'Equatorial Guinea', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('er', 'eri', '232', 'ERITREA', 'Eritrea', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ee', 'est', '233', 'ESTONIA', 'Estonia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('et', 'eth', '231', 'ETHIOPIA', 'Ethiopia', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fk', 'flk', '238', 'FALKLAND ISLANDS (MALVINAS)', 'Falkland Islands (Malvinas)', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fo', 'fro', '234', 'FAROE ISLANDS', 'Faroe Islands', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fj', 'fji', '242', 'FIJI', 'Fiji', NULL, NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:39.845+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fi', 'fin', '246', 'FINLAND', 'Finland', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gf', 'guf', '254', 'FRENCH GUIANA', 'French Guiana', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pf', 'pyf', '258', 'FRENCH POLYNESIA', 'French Polynesia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tf', 'atf', '260', 'FRENCH SOUTHERN TERRITORIES', 'French Southern Territories', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ga', 'gab', '266', 'GABON', 'Gabon', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gm', 'gmb', '270', 'GAMBIA', 'Gambia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ge', 'geo', '268', 'GEORGIA', 'Georgia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gh', 'gha', '288', 'GHANA', 'Ghana', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gi', 'gib', '292', 'GIBRALTAR', 'Gibraltar', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gr', 'grc', '300', 'GREECE', 'Greece', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gl', 'grl', '304', 'GREENLAND', 'Greenland', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gd', 'grd', '308', 'GRENADA', 'Grenada', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gp', 'glp', '312', 'GUADELOUPE', 'Guadeloupe', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gu', 'gum', '316', 'GUAM', 'Guam', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gt', 'gtm', '320', 'GUATEMALA', 'Guatemala', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gg', 'ggy', '831', 'GUERNSEY', 'Guernsey', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gn', 'gin', '324', 'GUINEA', 'Guinea', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gw', 'gnb', '624', 'GUINEA-BISSAU', 'Guinea-Bissau', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gy', 'guy', '328', 'GUYANA', 'Guyana', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ht', 'hti', '332', 'HAITI', 'Haiti', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('hm', 'hmd', '334', 'HEARD ISLAND AND MCDONALD ISLANDS', 'Heard Island And Mcdonald Islands', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('va', 'vat', '336', 'HOLY SEE (VATICAN CITY STATE)', 'Holy See (Vatican City State)', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('hn', 'hnd', '340', 'HONDURAS', 'Honduras', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('hk', 'hkg', '344', 'HONG KONG', 'Hong Kong', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('hu', 'hun', '348', 'HUNGARY', 'Hungary', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('is', 'isl', '352', 'ICELAND', 'Iceland', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('in', 'ind', '356', 'INDIA', 'India', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('id', 'idn', '360', 'INDONESIA', 'Indonesia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ir', 'irn', '364', 'IRAN, ISLAMIC REPUBLIC OF', 'Iran, Islamic Republic of', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('iq', 'irq', '368', 'IRAQ', 'Iraq', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ie', 'irl', '372', 'IRELAND', 'Ireland', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('im', 'imn', '833', 'ISLE OF MAN', 'Isle Of Man', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('il', 'isr', '376', 'ISRAEL', 'Israel', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('jm', 'jam', '388', 'JAMAICA', 'Jamaica', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('jp', 'jpn', '392', 'JAPAN', 'Japan', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('je', 'jey', '832', 'JERSEY', 'Jersey', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('jo', 'jor', '400', 'JORDAN', 'Jordan', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kz', 'kaz', '398', 'KAZAKHSTAN', 'Kazakhstan', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ke', 'ken', '404', 'KENYA', 'Kenya', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ki', 'kir', '296', 'KIRIBATI', 'Kiribati', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kp', 'prk', '408', 'KOREA, DEMOCRATIC PEOPLE''S REPUBLIC OF', 'Korea, Democratic People''s Republic of', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kr', 'kor', '410', 'KOREA, REPUBLIC OF', 'Korea, Republic of', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('xk', 'xkx', '900', 'KOSOVO', 'Kosovo', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kw', 'kwt', '414', 'KUWAIT', 'Kuwait', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kg', 'kgz', '417', 'KYRGYZSTAN', 'Kyrgyzstan', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('la', 'lao', '418', 'LAO PEOPLE''S DEMOCRATIC REPUBLIC', 'Lao People''s Democratic Republic', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lv', 'lva', '428', 'LATVIA', 'Latvia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lb', 'lbn', '422', 'LEBANON', 'Lebanon', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ls', 'lso', '426', 'LESOTHO', 'Lesotho', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lr', 'lbr', '430', 'LIBERIA', 'Liberia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ly', 'lby', '434', 'LIBYA', 'Libya', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('li', 'lie', '438', 'LIECHTENSTEIN', 'Liechtenstein', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lt', 'ltu', '440', 'LITHUANIA', 'Lithuania', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lu', 'lux', '442', 'LUXEMBOURG', 'Luxembourg', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mo', 'mac', '446', 'MACAO', 'Macao', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mg', 'mdg', '450', 'MADAGASCAR', 'Madagascar', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mw', 'mwi', '454', 'MALAWI', 'Malawi', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('my', 'mys', '458', 'MALAYSIA', 'Malaysia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mv', 'mdv', '462', 'MALDIVES', 'Maldives', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ml', 'mli', '466', 'MALI', 'Mali', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mt', 'mlt', '470', 'MALTA', 'Malta', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mh', 'mhl', '584', 'MARSHALL ISLANDS', 'Marshall Islands', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mq', 'mtq', '474', 'MARTINIQUE', 'Martinique', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mr', 'mrt', '478', 'MAURITANIA', 'Mauritania', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mu', 'mus', '480', 'MAURITIUS', 'Mauritius', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('yt', 'myt', '175', 'MAYOTTE', 'Mayotte', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mx', 'mex', '484', 'MEXICO', 'Mexico', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fm', 'fsm', '583', 'MICRONESIA, FEDERATED STATES OF', 'Micronesia, Federated States of', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('md', 'mda', '498', 'MOLDOVA, REPUBLIC OF', 'Moldova, Republic of', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mc', 'mco', '492', 'MONACO', 'Monaco', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mn', 'mng', '496', 'MONGOLIA', 'Mongolia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('me', 'mne', '499', 'MONTENEGRO', 'Montenegro', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ms', 'msr', '500', 'MONTSERRAT', 'Montserrat', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ma', 'mar', '504', 'MOROCCO', 'Morocco', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mz', 'moz', '508', 'MOZAMBIQUE', 'Mozambique', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mm', 'mmr', '104', 'MYANMAR', 'Myanmar', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('na', 'nam', '516', 'NAMIBIA', 'Namibia', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nr', 'nru', '520', 'NAURU', 'Nauru', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('np', 'npl', '524', 'NEPAL', 'Nepal', NULL, NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:39.846+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nl', 'nld', '528', 'NETHERLANDS', 'Netherlands', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nc', 'ncl', '540', 'NEW CALEDONIA', 'New Caledonia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nz', 'nzl', '554', 'NEW ZEALAND', 'New Zealand', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ni', 'nic', '558', 'NICARAGUA', 'Nicaragua', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ne', 'ner', '562', 'NIGER', 'Niger', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ng', 'nga', '566', 'NIGERIA', 'Nigeria', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nu', 'niu', '570', 'NIUE', 'Niue', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('nf', 'nfk', '574', 'NORFOLK ISLAND', 'Norfolk Island', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mk', 'mkd', '807', 'NORTH MACEDONIA', 'North Macedonia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mp', 'mnp', '580', 'NORTHERN MARIANA ISLANDS', 'Northern Mariana Islands', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('no', 'nor', '578', 'NORWAY', 'Norway', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('om', 'omn', '512', 'OMAN', 'Oman', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pk', 'pak', '586', 'PAKISTAN', 'Pakistan', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pw', 'plw', '585', 'PALAU', 'Palau', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ps', 'pse', '275', 'PALESTINIAN TERRITORY, OCCUPIED', 'Palestinian Territory, Occupied', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pa', 'pan', '591', 'PANAMA', 'Panama', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pg', 'png', '598', 'PAPUA NEW GUINEA', 'Papua New Guinea', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('py', 'pry', '600', 'PARAGUAY', 'Paraguay', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pe', 'per', '604', 'PERU', 'Peru', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ph', 'phl', '608', 'PHILIPPINES', 'Philippines', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pn', 'pcn', '612', 'PITCAIRN', 'Pitcairn', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pl', 'pol', '616', 'POLAND', 'Poland', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pt', 'prt', '620', 'PORTUGAL', 'Portugal', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pr', 'pri', '630', 'PUERTO RICO', 'Puerto Rico', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('qa', 'qat', '634', 'QATAR', 'Qatar', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('re', 'reu', '638', 'REUNION', 'Reunion', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ro', 'rom', '642', 'ROMANIA', 'Romania', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ru', 'rus', '643', 'RUSSIAN FEDERATION', 'Russian Federation', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('rw', 'rwa', '646', 'RWANDA', 'Rwanda', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('bl', 'blm', '652', 'SAINT BARTHÉLEMY', 'Saint Barthélemy', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sh', 'shn', '654', 'SAINT HELENA', 'Saint Helena', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('kn', 'kna', '659', 'SAINT KITTS AND NEVIS', 'Saint Kitts and Nevis', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lc', 'lca', '662', 'SAINT LUCIA', 'Saint Lucia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('mf', 'maf', '663', 'SAINT MARTIN (FRENCH PART)', 'Saint Martin (French part)', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('pm', 'spm', '666', 'SAINT PIERRE AND MIQUELON', 'Saint Pierre and Miquelon', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('vc', 'vct', '670', 'SAINT VINCENT AND THE GRENADINES', 'Saint Vincent and the Grenadines', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ws', 'wsm', '882', 'SAMOA', 'Samoa', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sm', 'smr', '674', 'SAN MARINO', 'San Marino', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('st', 'stp', '678', 'SAO TOME AND PRINCIPE', 'Sao Tome and Principe', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sa', 'sau', '682', 'SAUDI ARABIA', 'Saudi Arabia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sn', 'sen', '686', 'SENEGAL', 'Senegal', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('rs', 'srb', '688', 'SERBIA', 'Serbia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sc', 'syc', '690', 'SEYCHELLES', 'Seychelles', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sl', 'sle', '694', 'SIERRA LEONE', 'Sierra Leone', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sg', 'sgp', '702', 'SINGAPORE', 'Singapore', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sx', 'sxm', '534', 'SINT MAARTEN', 'Sint Maarten', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sk', 'svk', '703', 'SLOVAKIA', 'Slovakia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('si', 'svn', '705', 'SLOVENIA', 'Slovenia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sb', 'slb', '090', 'SOLOMON ISLANDS', 'Solomon Islands', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('so', 'som', '706', 'SOMALIA', 'Somalia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('za', 'zaf', '710', 'SOUTH AFRICA', 'South Africa', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gs', 'sgs', '239', 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS', 'South Georgia and the South Sandwich Islands', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ss', 'ssd', '728', 'SOUTH SUDAN', 'South Sudan', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('lk', 'lka', '144', 'SRI LANKA', 'Sri Lanka', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sd', 'sdn', '729', 'SUDAN', 'Sudan', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sr', 'sur', '740', 'SURINAME', 'Suriname', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sj', 'sjm', '744', 'SVALBARD AND JAN MAYEN', 'Svalbard and Jan Mayen', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sz', 'swz', '748', 'SWAZILAND', 'Swaziland', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ch', 'che', '756', 'SWITZERLAND', 'Switzerland', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sy', 'syr', '760', 'SYRIAN ARAB REPUBLIC', 'Syrian Arab Republic', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tw', 'twn', '158', 'TAIWAN, PROVINCE OF CHINA', 'Taiwan, Province of China', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tj', 'tjk', '762', 'TAJIKISTAN', 'Tajikistan', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tz', 'tza', '834', 'TANZANIA, UNITED REPUBLIC OF', 'Tanzania, United Republic of', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('th', 'tha', '764', 'THAILAND', 'Thailand', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tl', 'tls', '626', 'TIMOR LESTE', 'Timor Leste', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tg', 'tgo', '768', 'TOGO', 'Togo', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tk', 'tkl', '772', 'TOKELAU', 'Tokelau', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('to', 'ton', '776', 'TONGA', 'Tonga', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tt', 'tto', '780', 'TRINIDAD AND TOBAGO', 'Trinidad and Tobago', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tn', 'tun', '788', 'TUNISIA', 'Tunisia', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tr', 'tur', '792', 'TURKEY', 'Turkey', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tm', 'tkm', '795', 'TURKMENISTAN', 'Turkmenistan', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tc', 'tca', '796', 'TURKS AND CAICOS ISLANDS', 'Turks and Caicos Islands', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('tv', 'tuv', '798', 'TUVALU', 'Tuvalu', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ug', 'uga', '800', 'UGANDA', 'Uganda', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ua', 'ukr', '804', 'UKRAINE', 'Ukraine', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ae', 'are', '784', 'UNITED ARAB EMIRATES', 'United Arab Emirates', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('us', 'usa', '840', 'UNITED STATES', 'United States', NULL, NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:39.847+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('um', 'umi', '581', 'UNITED STATES MINOR OUTLYING ISLANDS', 'United States Minor Outlying Islands', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('uy', 'ury', '858', 'URUGUAY', 'Uruguay', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('uz', 'uzb', '860', 'UZBEKISTAN', 'Uzbekistan', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('vu', 'vut', '548', 'VANUATU', 'Vanuatu', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ve', 'ven', '862', 'VENEZUELA', 'Venezuela', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('vn', 'vnm', '704', 'VIET NAM', 'Viet Nam', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('vg', 'vgb', '092', 'VIRGIN ISLANDS, BRITISH', 'Virgin Islands, British', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('vi', 'vir', '850', 'VIRGIN ISLANDS, U.S.', 'Virgin Islands, U.S.', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('wf', 'wlf', '876', 'WALLIS AND FUTUNA', 'Wallis and Futuna', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('eh', 'esh', '732', 'WESTERN SAHARA', 'Western Sahara', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ye', 'yem', '887', 'YEMEN', 'Yemen', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('zm', 'zmb', '894', 'ZAMBIA', 'Zambia', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('zw', 'zwe', '716', 'ZIMBABWE', 'Zimbabwe', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('ax', 'ala', '248', 'ÅLAND ISLANDS', 'Åland Islands', NULL, NULL, '2026-09-12 17:51:39.848+06', '2026-09-12 17:51:39.848+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('dk', 'dnk', '208', 'DENMARK', 'Denmark', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.845+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('fr', 'fra', '250', 'FRANCE', 'France', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('de', 'deu', '276', 'GERMANY', 'Germany', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('it', 'ita', '380', 'ITALY', 'Italy', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.846+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('es', 'esp', '724', 'SPAIN', 'Spain', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('se', 'swe', '752', 'SWEDEN', 'Sweden', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:59.542+06', NULL);
INSERT INTO "public"."region_country" ("iso_2", "iso_3", "num_code", "name", "display_name", "region_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('gb', 'gbr', '826', 'UNITED KINGDOM', 'United Kingdom', 'reg_01M2AQBJ9A89RTYJDP98PH1R6X', NULL, '2026-09-12 17:51:39.847+06', '2026-09-12 17:51:59.542+06', NULL);


--
-- Data for Name: region_payment_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."region_payment_provider" ("region_id", "payment_provider_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('reg_01M2AQBJ9A89RTYJDP98PH1R6X', 'pp_system_default', 'regpp_01M2AQBJAHNECRWC2BWJJYMC82', '2026-09-12 17:51:59.569477+06', '2026-09-12 17:51:59.569477+06', NULL);


--
-- Data for Name: reservation_item; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: return; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: return_fulfillment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: return_item; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: return_reason; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: sales_channel; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."sales_channel" ("id", "name", "description", "is_disabled", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'Default Sales Channel', 'Created by Medusa', false, NULL, '2026-09-12 17:51:59.445+06', '2026-09-12 17:51:59.445+06', NULL);


--
-- Data for Name: sales_channel_stock_location; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."sales_channel_stock_location" ("sales_channel_id", "stock_location_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('sc_01M2AQBJ6MH9H44S2ZK2E68F74', 'sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', 'scloc_01M2AQBJHNDEFTSHAQ62MHDE4Y', '2026-09-12 17:51:59.79689+06', '2026-09-12 17:51:59.79689+06', NULL);


--
-- Data for Name: script_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (1, 'migrate-normalize-currency-codes-normalization.js', '2026-09-12 17:51:45.150082+06', '2026-09-12 17:51:45.237567+06');
INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (2, 'migrate-product-option-link-ids.js', '2026-09-12 17:51:45.259416+06', '2026-09-12 17:51:45.26987+06');
INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (3, 'migrate-product-shipping-profile.js', '2026-09-12 17:51:59.243846+06', '2026-09-12 17:51:59.32814+06');
INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (4, 'migrate-tax-region-provider.js', '2026-09-12 17:51:59.34748+06', '2026-09-12 17:51:59.361834+06');
INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (5, 'reconcile-inventory-reserved-quantity.js', '2026-09-12 17:51:59.383095+06', '2026-09-12 17:51:59.396299+06');
INSERT INTO "public"."script_migrations" ("id", "script_name", "created_at", "finished_at") VALUES (6, 'initial-data-seed.ts', '2026-09-12 17:51:59.438934+06', '2026-09-12 17:52:00.494981+06');


--
-- Data for Name: search_index; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: search_index_sync; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: search_index_version; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: search_postgres_index; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: service_zone; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."service_zone" ("id", "name", "metadata", "fulfillment_set_id", "created_at", "updated_at", "deleted_at") VALUES ('serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', 'Europe', NULL, 'fuset_01M2AQBJCNM56GJ0DHAKF728NA', '2026-09-12 17:51:59.638+06', '2026-09-12 17:51:59.638+06', NULL);


--
-- Data for Name: shipping_option; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."shipping_option" ("id", "name", "price_type", "service_zone_id", "shipping_profile_id", "provider_id", "data", "metadata", "shipping_option_type_id", "created_at", "updated_at", "deleted_at") VALUES ('so_01M2AQBJF4RGXHZWYACYK0FR42', 'Standard Shipping', 'flat', 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'manual_manual', NULL, NULL, 'sotype_01M2AQBJF36KA7QFAXD9C4VYWQ', '2026-09-12 17:51:59.717+06', '2026-09-12 17:51:59.717+06', NULL);
INSERT INTO "public"."shipping_option" ("id", "name", "price_type", "service_zone_id", "shipping_profile_id", "provider_id", "data", "metadata", "shipping_option_type_id", "created_at", "updated_at", "deleted_at") VALUES ('so_01M2AQBJF4P8WHASPP2DZMC0KX', 'Express Shipping', 'flat', 'serzo_01M2AQBJCN3ASB8HZV2VJWZEV7', 'sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'manual_manual', NULL, NULL, 'sotype_01M2AQBJF4QM55WST41DD0PP99', '2026-09-12 17:51:59.717+06', '2026-09-12 17:51:59.717+06', NULL);


--
-- Data for Name: shipping_option_price_set; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."shipping_option_price_set" ("shipping_option_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('so_01M2AQBJF4RGXHZWYACYK0FR42', 'pset_01M2AQBJFXNGW6V9K3GTXFPK8S', 'sops_01M2AQBJH9AZEV09T5R0FN4JST', '2026-09-12 17:51:59.784472+06', '2026-09-12 17:51:59.784472+06', NULL);
INSERT INTO "public"."shipping_option_price_set" ("shipping_option_id", "price_set_id", "id", "created_at", "updated_at", "deleted_at") VALUES ('so_01M2AQBJF4P8WHASPP2DZMC0KX', 'pset_01M2AQBJFYYF92V5M5YBCQGR8W', 'sops_01M2AQBJHAQDD2WP5HXTBB4JEY', '2026-09-12 17:51:59.784472+06', '2026-09-12 17:51:59.784472+06', NULL);


--
-- Data for Name: shipping_option_rule; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."shipping_option_rule" ("id", "attribute", "operator", "value", "shipping_option_id", "created_at", "updated_at", "deleted_at") VALUES ('sorul_01M2AQBJF3A54STFK0DK5MVS9J', 'enabled_in_store', 'eq', '"true"', 'so_01M2AQBJF4RGXHZWYACYK0FR42', '2026-09-12 17:51:59.717+06', '2026-09-12 17:51:59.717+06', NULL);
INSERT INTO "public"."shipping_option_rule" ("id", "attribute", "operator", "value", "shipping_option_id", "created_at", "updated_at", "deleted_at") VALUES ('sorul_01M2AQBJF3Y46TPA6S9CP4NC42', 'is_return', 'eq', '"false"', 'so_01M2AQBJF4RGXHZWYACYK0FR42', '2026-09-12 17:51:59.718+06', '2026-09-12 17:51:59.718+06', NULL);
INSERT INTO "public"."shipping_option_rule" ("id", "attribute", "operator", "value", "shipping_option_id", "created_at", "updated_at", "deleted_at") VALUES ('sorul_01M2AQBJF43YR9C752S37KNKGH', 'enabled_in_store', 'eq', '"true"', 'so_01M2AQBJF4P8WHASPP2DZMC0KX', '2026-09-12 17:51:59.718+06', '2026-09-12 17:51:59.718+06', NULL);
INSERT INTO "public"."shipping_option_rule" ("id", "attribute", "operator", "value", "shipping_option_id", "created_at", "updated_at", "deleted_at") VALUES ('sorul_01M2AQBJF42A5SK60BPSTVRRMR', 'is_return', 'eq', '"false"', 'so_01M2AQBJF4P8WHASPP2DZMC0KX', '2026-09-12 17:51:59.718+06', '2026-09-12 17:51:59.718+06', NULL);


--
-- Data for Name: shipping_option_type; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."shipping_option_type" ("id", "label", "description", "code", "created_at", "updated_at", "deleted_at") VALUES ('sotype_01M2AQBJF36KA7QFAXD9C4VYWQ', 'Standard', 'Ship in 2-3 days.', 'standard', '2026-09-12 17:51:59.717+06', '2026-09-12 17:51:59.717+06', NULL);
INSERT INTO "public"."shipping_option_type" ("id", "label", "description", "code", "created_at", "updated_at", "deleted_at") VALUES ('sotype_01M2AQBJF4QM55WST41DD0PP99', 'Express', 'Ship in 24 hours.', 'express', '2026-09-12 17:51:59.717+06', '2026-09-12 17:51:59.717+06', NULL);


--
-- Data for Name: shipping_profile; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."shipping_profile" ("id", "name", "type", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('sp_01M2AQBJ2JEFBPK1PSRB6ADTG8', 'Default Shipping Profile', 'default', NULL, '2026-09-12 17:51:59.314+06', '2026-09-12 17:51:59.314+06', NULL);


--
-- Data for Name: stock_location; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."stock_location" ("id", "created_at", "updated_at", "deleted_at", "name", "address_id", "metadata") VALUES ('sloc_01M2AQBJBGCFENNWHR7VJDHPCZ', '2026-09-12 17:51:59.601+06', '2026-09-12 17:51:59.601+06', NULL, 'European Warehouse', 'laddr_01M2AQBJBGXPQE3TJSXGK2BSAD', NULL);


--
-- Data for Name: stock_location_address; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."stock_location_address" ("id", "created_at", "updated_at", "deleted_at", "address_1", "address_2", "company", "city", "country_code", "phone", "province", "postal_code", "metadata") VALUES ('laddr_01M2AQBJBGXPQE3TJSXGK2BSAD', '2026-09-12 17:51:59.6+06', '2026-09-12 17:51:59.6+06', NULL, '', NULL, NULL, 'Copenhagen', 'DK', NULL, NULL, NULL, NULL);


--
-- Data for Name: store; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."store" ("id", "name", "default_sales_channel_id", "default_region_id", "default_location_id", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('store_01M2AQBJ89SATJ8GM9F5YAYAMN', 'PEPTECH', 'sc_01M2AQBJ6MH9H44S2ZK2E68F74', NULL, NULL, NULL, '2026-09-12 17:51:59.495915+06', '2026-09-12 17:51:59.495915+06', NULL);


--
-- Data for Name: store_currency; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."store_currency" ("id", "currency_code", "is_default", "store_id", "created_at", "updated_at", "deleted_at") VALUES ('stocur_01M2AQBJ8GVTMBSWX70FDKTPNJ', 'eur', false, 'store_01M2AQBJ89SATJ8GM9F5YAYAMN', '2026-09-12 17:51:59.495915+06', '2026-09-12 17:51:59.495915+06', NULL);
INSERT INTO "public"."store_currency" ("id", "currency_code", "is_default", "store_id", "created_at", "updated_at", "deleted_at") VALUES ('stocur_01M2AQBJ8GTY7XPSNSNVZKTA7P', 'usd', false, 'store_01M2AQBJ89SATJ8GM9F5YAYAMN', '2026-09-12 17:51:59.495915+06', '2026-09-12 17:51:59.495915+06', NULL);
INSERT INTO "public"."store_currency" ("id", "currency_code", "is_default", "store_id", "created_at", "updated_at", "deleted_at") VALUES ('stocur_peptech_gbp_2026', 'gbp', true, 'store_01M2AQBJ89SATJ8GM9F5YAYAMN', '2026-09-12 18:41:57.310362+06', '2026-09-12 18:41:57.310362+06', NULL);


--
-- Data for Name: store_locale; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tax_provider; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."tax_provider" ("id", "is_enabled", "created_at", "updated_at", "deleted_at") VALUES ('tp_system', true, '2026-09-12 17:51:39.94+06', '2026-09-12 17:51:39.94+06', NULL);


--
-- Data for Name: tax_rate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tax_rate_rule; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: tax_region; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0KEZGEDBP2YTAJE8Q', 'tp_system', 'gb', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0T4Y7AJANA8BNHX8N', 'tp_system', 'de', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0DBR3QM5V5AJQZ73C', 'tp_system', 'dk', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0GH8SBNG96REYHX5E', 'tp_system', 'se', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0W38517NNYEA1TGVV', 'tp_system', 'fr', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB0KTXN4HNF3SSFESD9', 'tp_system', 'es', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);
INSERT INTO "public"."tax_region" ("id", "provider_id", "country_code", "province_code", "parent_id", "metadata", "created_at", "updated_at", "created_by", "deleted_at") VALUES ('txreg_01M2AQBJB18NCT7V0J1SW1X1XP', 'tp_system', 'it', NULL, NULL, NULL, '2026-09-12 17:51:59.587+06', '2026-09-12 17:51:59.587+06', NULL, NULL);


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO "public"."user" ("id", "first_name", "last_name", "email", "avatar_url", "metadata", "created_at", "updated_at", "deleted_at") VALUES ('user_01M2AQBY1MKD7BCMDJRVBBMKJ8', NULL, NULL, 'admin@peptech.bio', NULL, NULL, '2026-09-12 17:52:11.572+06', '2026-09-12 17:52:11.572+06', NULL);


--
-- Data for Name: user_preference; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: user_rbac_role; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: view_configuration; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Data for Name: workflow_execution; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: link_module_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."link_module_migrations_id_seq"', 20, true);


--
-- Name: mikro_orm_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."mikro_orm_migrations_id_seq"', 181, true);


--
-- Name: order_change_action_ordering_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."order_change_action_ordering_seq"', 2, true);


--
-- Name: order_claim_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."order_claim_display_id_seq"', 1, false);


--
-- Name: order_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."order_display_id_seq"', 10, true);


--
-- Name: order_exchange_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."order_exchange_display_id_seq"', 1, false);


--
-- Name: return_display_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."return_display_id_seq"', 1, false);


--
-- Name: script_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."script_migrations_id_seq"', 6, true);


--
-- Name: account_holder account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."account_holder"
    ADD CONSTRAINT "account_holder_pkey" PRIMARY KEY ("id");


--
-- Name: api_key api_key_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."api_key"
    ADD CONSTRAINT "api_key_pkey" PRIMARY KEY ("id");


--
-- Name: application_method_buy_rules application_method_buy_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_buy_rules"
    ADD CONSTRAINT "application_method_buy_rules_pkey" PRIMARY KEY ("application_method_id", "promotion_rule_id");


--
-- Name: application_method_target_rules application_method_target_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_target_rules"
    ADD CONSTRAINT "application_method_target_rules_pkey" PRIMARY KEY ("application_method_id", "promotion_rule_id");


--
-- Name: auth_identity auth_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_identity"
    ADD CONSTRAINT "auth_identity_pkey" PRIMARY KEY ("id");


--
-- Name: auth_mfa_factor auth_mfa_factor_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_mfa_factor"
    ADD CONSTRAINT "auth_mfa_factor_pkey" PRIMARY KEY ("id");


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_mfa_recovery_code"
    ADD CONSTRAINT "auth_mfa_recovery_code_pkey" PRIMARY KEY ("id");


--
-- Name: auth_password_reset_token auth_password_reset_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_password_reset_token"
    ADD CONSTRAINT "auth_password_reset_token_pkey" PRIMARY KEY ("id");


--
-- Name: auth_verification auth_verification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_verification"
    ADD CONSTRAINT "auth_verification_pkey" PRIMARY KEY ("id");


--
-- Name: capture capture_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."capture"
    ADD CONSTRAINT "capture_pkey" PRIMARY KEY ("id");


--
-- Name: cart_address cart_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_address"
    ADD CONSTRAINT "cart_address_pkey" PRIMARY KEY ("id");


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item_adjustment"
    ADD CONSTRAINT "cart_line_item_adjustment_pkey" PRIMARY KEY ("id");


--
-- Name: cart_line_item cart_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item"
    ADD CONSTRAINT "cart_line_item_pkey" PRIMARY KEY ("id");


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item_tax_line"
    ADD CONSTRAINT "cart_line_item_tax_line_pkey" PRIMARY KEY ("id");


--
-- Name: cart_payment_collection cart_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_payment_collection"
    ADD CONSTRAINT "cart_payment_collection_pkey" PRIMARY KEY ("cart_id", "payment_collection_id");


--
-- Name: cart cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart"
    ADD CONSTRAINT "cart_pkey" PRIMARY KEY ("id");


--
-- Name: cart_promotion cart_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_promotion"
    ADD CONSTRAINT "cart_promotion_pkey" PRIMARY KEY ("cart_id", "promotion_id");


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method_adjustment"
    ADD CONSTRAINT "cart_shipping_method_adjustment_pkey" PRIMARY KEY ("id");


--
-- Name: cart_shipping_method cart_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method"
    ADD CONSTRAINT "cart_shipping_method_pkey" PRIMARY KEY ("id");


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method_tax_line"
    ADD CONSTRAINT "cart_shipping_method_tax_line_pkey" PRIMARY KEY ("id");


--
-- Name: credit_line credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."credit_line"
    ADD CONSTRAINT "credit_line_pkey" PRIMARY KEY ("id");


--
-- Name: currency currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."currency"
    ADD CONSTRAINT "currency_pkey" PRIMARY KEY ("code");


--
-- Name: customer_account_holder customer_account_holder_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_account_holder"
    ADD CONSTRAINT "customer_account_holder_pkey" PRIMARY KEY ("customer_id", "account_holder_id");


--
-- Name: customer_address customer_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_address"
    ADD CONSTRAINT "customer_address_pkey" PRIMARY KEY ("id");


--
-- Name: customer_group_customer customer_group_customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_group_customer"
    ADD CONSTRAINT "customer_group_customer_pkey" PRIMARY KEY ("id");


--
-- Name: customer_group customer_group_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_group"
    ADD CONSTRAINT "customer_group_pkey" PRIMARY KEY ("id");


--
-- Name: customer customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer"
    ADD CONSTRAINT "customer_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment_address fulfillment_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_address"
    ADD CONSTRAINT "fulfillment_address_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment_item fulfillment_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_item"
    ADD CONSTRAINT "fulfillment_item_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment_label fulfillment_label_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_label"
    ADD CONSTRAINT "fulfillment_label_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment"
    ADD CONSTRAINT "fulfillment_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment_provider fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_provider"
    ADD CONSTRAINT "fulfillment_provider_pkey" PRIMARY KEY ("id");


--
-- Name: fulfillment_set fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_set"
    ADD CONSTRAINT "fulfillment_set_pkey" PRIMARY KEY ("id");


--
-- Name: geo_zone geo_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."geo_zone"
    ADD CONSTRAINT "geo_zone_pkey" PRIMARY KEY ("id");


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."image"
    ADD CONSTRAINT "image_pkey" PRIMARY KEY ("id");


--
-- Name: inventory_item inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_item"
    ADD CONSTRAINT "inventory_item_pkey" PRIMARY KEY ("id");


--
-- Name: inventory_level inventory_level_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_level"
    ADD CONSTRAINT "inventory_level_pkey" PRIMARY KEY ("id");


--
-- Name: invite invite_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."invite"
    ADD CONSTRAINT "invite_pkey" PRIMARY KEY ("id");


--
-- Name: invite_rbac_role invite_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."invite_rbac_role"
    ADD CONSTRAINT "invite_rbac_role_pkey" PRIMARY KEY ("invite_id", "rbac_role_id");


--
-- Name: layout_configuration layout_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."layout_configuration"
    ADD CONSTRAINT "layout_configuration_pkey" PRIMARY KEY ("id");


--
-- Name: link_module_migrations link_module_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."link_module_migrations"
    ADD CONSTRAINT "link_module_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: link_module_migrations link_module_migrations_table_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."link_module_migrations"
    ADD CONSTRAINT "link_module_migrations_table_name_key" UNIQUE ("table_name");


--
-- Name: location_fulfillment_provider location_fulfillment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."location_fulfillment_provider"
    ADD CONSTRAINT "location_fulfillment_provider_pkey" PRIMARY KEY ("stock_location_id", "fulfillment_provider_id");


--
-- Name: location_fulfillment_set location_fulfillment_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."location_fulfillment_set"
    ADD CONSTRAINT "location_fulfillment_set_pkey" PRIMARY KEY ("stock_location_id", "fulfillment_set_id");


--
-- Name: mikro_orm_migrations mikro_orm_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."mikro_orm_migrations"
    ADD CONSTRAINT "mikro_orm_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: notification notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");


--
-- Name: notification_provider notification_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification_provider"
    ADD CONSTRAINT "notification_provider_pkey" PRIMARY KEY ("id");


--
-- Name: order_address order_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_address"
    ADD CONSTRAINT "order_address_pkey" PRIMARY KEY ("id");


--
-- Name: order_cart order_cart_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_cart"
    ADD CONSTRAINT "order_cart_pkey" PRIMARY KEY ("order_id", "cart_id");


--
-- Name: order_change_action order_change_action_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_change_action"
    ADD CONSTRAINT "order_change_action_pkey" PRIMARY KEY ("id");


--
-- Name: order_change order_change_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_change"
    ADD CONSTRAINT "order_change_pkey" PRIMARY KEY ("id");


--
-- Name: order_claim_item_image order_claim_item_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_claim_item_image"
    ADD CONSTRAINT "order_claim_item_image_pkey" PRIMARY KEY ("id");


--
-- Name: order_claim_item order_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_claim_item"
    ADD CONSTRAINT "order_claim_item_pkey" PRIMARY KEY ("id");


--
-- Name: order_claim order_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_claim"
    ADD CONSTRAINT "order_claim_pkey" PRIMARY KEY ("id");


--
-- Name: order_credit_line order_credit_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_credit_line"
    ADD CONSTRAINT "order_credit_line_pkey" PRIMARY KEY ("id");


--
-- Name: order_exchange_item order_exchange_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_exchange_item"
    ADD CONSTRAINT "order_exchange_item_pkey" PRIMARY KEY ("id");


--
-- Name: order_exchange order_exchange_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_exchange"
    ADD CONSTRAINT "order_exchange_pkey" PRIMARY KEY ("id");


--
-- Name: order_fulfillment order_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_fulfillment"
    ADD CONSTRAINT "order_fulfillment_pkey" PRIMARY KEY ("order_id", "fulfillment_id");


--
-- Name: order_item order_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_item"
    ADD CONSTRAINT "order_item_pkey" PRIMARY KEY ("id");


--
-- Name: order_line_item_adjustment order_line_item_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item_adjustment"
    ADD CONSTRAINT "order_line_item_adjustment_pkey" PRIMARY KEY ("id");


--
-- Name: order_line_item order_line_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item"
    ADD CONSTRAINT "order_line_item_pkey" PRIMARY KEY ("id");


--
-- Name: order_line_item_tax_line order_line_item_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item_tax_line"
    ADD CONSTRAINT "order_line_item_tax_line_pkey" PRIMARY KEY ("id");


--
-- Name: order_payment_collection order_payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_payment_collection"
    ADD CONSTRAINT "order_payment_collection_pkey" PRIMARY KEY ("order_id", "payment_collection_id");


--
-- Name: order order_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_pkey" PRIMARY KEY ("id");


--
-- Name: order_promotion order_promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_promotion"
    ADD CONSTRAINT "order_promotion_pkey" PRIMARY KEY ("order_id", "promotion_id");


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping_method_adjustment"
    ADD CONSTRAINT "order_shipping_method_adjustment_pkey" PRIMARY KEY ("id");


--
-- Name: order_shipping_method order_shipping_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping_method"
    ADD CONSTRAINT "order_shipping_method_pkey" PRIMARY KEY ("id");


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping_method_tax_line"
    ADD CONSTRAINT "order_shipping_method_tax_line_pkey" PRIMARY KEY ("id");


--
-- Name: order_shipping order_shipping_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping"
    ADD CONSTRAINT "order_shipping_pkey" PRIMARY KEY ("id");


--
-- Name: order_summary order_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_summary"
    ADD CONSTRAINT "order_summary_pkey" PRIMARY KEY ("id");


--
-- Name: order_transaction order_transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_transaction"
    ADD CONSTRAINT "order_transaction_pkey" PRIMARY KEY ("id");


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_collection_payment_providers"
    ADD CONSTRAINT "payment_collection_payment_providers_pkey" PRIMARY KEY ("payment_collection_id", "payment_provider_id");


--
-- Name: payment_collection payment_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_collection"
    ADD CONSTRAINT "payment_collection_pkey" PRIMARY KEY ("id");


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment"
    ADD CONSTRAINT "payment_pkey" PRIMARY KEY ("id");


--
-- Name: payment_provider payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_provider"
    ADD CONSTRAINT "payment_provider_pkey" PRIMARY KEY ("id");


--
-- Name: payment_session payment_session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_session"
    ADD CONSTRAINT "payment_session_pkey" PRIMARY KEY ("id");


--
-- Name: price_list price_list_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_list"
    ADD CONSTRAINT "price_list_pkey" PRIMARY KEY ("id");


--
-- Name: price_list_rule price_list_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_list_rule"
    ADD CONSTRAINT "price_list_rule_pkey" PRIMARY KEY ("id");


--
-- Name: price price_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price"
    ADD CONSTRAINT "price_pkey" PRIMARY KEY ("id");


--
-- Name: price_preference price_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_preference"
    ADD CONSTRAINT "price_preference_pkey" PRIMARY KEY ("id");


--
-- Name: price_rule price_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_rule"
    ADD CONSTRAINT "price_rule_pkey" PRIMARY KEY ("id");


--
-- Name: price_set price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_set"
    ADD CONSTRAINT "price_set_pkey" PRIMARY KEY ("id");


--
-- Name: product_category product_category_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_category"
    ADD CONSTRAINT "product_category_pkey" PRIMARY KEY ("id");


--
-- Name: product_category_product product_category_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_category_product"
    ADD CONSTRAINT "product_category_product_pkey" PRIMARY KEY ("product_id", "product_category_id");


--
-- Name: product_collection product_collection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_collection"
    ADD CONSTRAINT "product_collection_pkey" PRIMARY KEY ("id");


--
-- Name: product_option product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_option"
    ADD CONSTRAINT "product_option_pkey" PRIMARY KEY ("id");


--
-- Name: product_option_value product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_option_value"
    ADD CONSTRAINT "product_option_value_pkey" PRIMARY KEY ("id");


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_pkey" PRIMARY KEY ("id");


--
-- Name: product_product_option product_product_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option"
    ADD CONSTRAINT "product_product_option_pkey" PRIMARY KEY ("id");


--
-- Name: product_product_option_value product_product_option_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option_value"
    ADD CONSTRAINT "product_product_option_value_pkey" PRIMARY KEY ("id");


--
-- Name: product_sales_channel product_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_sales_channel"
    ADD CONSTRAINT "product_sales_channel_pkey" PRIMARY KEY ("product_id", "sales_channel_id");


--
-- Name: product_shipping_profile product_shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_shipping_profile"
    ADD CONSTRAINT "product_shipping_profile_pkey" PRIMARY KEY ("product_id", "shipping_profile_id");


--
-- Name: product_tag product_tag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_tag"
    ADD CONSTRAINT "product_tag_pkey" PRIMARY KEY ("id");


--
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_pkey" PRIMARY KEY ("product_id", "product_tag_id");


--
-- Name: product_type product_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_type"
    ADD CONSTRAINT "product_type_pkey" PRIMARY KEY ("id");


--
-- Name: product_variant_inventory_item product_variant_inventory_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_inventory_item"
    ADD CONSTRAINT "product_variant_inventory_item_pkey" PRIMARY KEY ("variant_id", "inventory_item_id");


--
-- Name: product_variant_option product_variant_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_option"
    ADD CONSTRAINT "product_variant_option_pkey" PRIMARY KEY ("variant_id", "option_value_id");


--
-- Name: product_variant product_variant_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant"
    ADD CONSTRAINT "product_variant_pkey" PRIMARY KEY ("id");


--
-- Name: product_variant_price_set product_variant_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_price_set"
    ADD CONSTRAINT "product_variant_price_set_pkey" PRIMARY KEY ("variant_id", "price_set_id");


--
-- Name: product_variant_product_image product_variant_product_image_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_product_image"
    ADD CONSTRAINT "product_variant_product_image_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_application_method promotion_application_method_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_application_method"
    ADD CONSTRAINT "promotion_application_method_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_campaign_budget promotion_campaign_budget_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_campaign_budget"
    ADD CONSTRAINT "promotion_campaign_budget_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_campaign_budget_usage"
    ADD CONSTRAINT "promotion_campaign_budget_usage_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_campaign promotion_campaign_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_campaign"
    ADD CONSTRAINT "promotion_campaign_pkey" PRIMARY KEY ("id");


--
-- Name: promotion promotion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion"
    ADD CONSTRAINT "promotion_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_promotion_rule promotion_promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_promotion_rule"
    ADD CONSTRAINT "promotion_promotion_rule_pkey" PRIMARY KEY ("promotion_id", "promotion_rule_id");


--
-- Name: promotion_rule promotion_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_rule"
    ADD CONSTRAINT "promotion_rule_pkey" PRIMARY KEY ("id");


--
-- Name: promotion_rule_value promotion_rule_value_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_rule_value"
    ADD CONSTRAINT "promotion_rule_value_pkey" PRIMARY KEY ("id");


--
-- Name: property_label property_label_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."property_label"
    ADD CONSTRAINT "property_label_pkey" PRIMARY KEY ("id");


--
-- Name: provider_identity provider_identity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."provider_identity"
    ADD CONSTRAINT "provider_identity_pkey" PRIMARY KEY ("id");


--
-- Name: publishable_api_key_sales_channel publishable_api_key_sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."publishable_api_key_sales_channel"
    ADD CONSTRAINT "publishable_api_key_sales_channel_pkey" PRIMARY KEY ("publishable_key_id", "sales_channel_id");


--
-- Name: refund refund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."refund"
    ADD CONSTRAINT "refund_pkey" PRIMARY KEY ("id");


--
-- Name: refund_reason refund_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."refund_reason"
    ADD CONSTRAINT "refund_reason_pkey" PRIMARY KEY ("id");


--
-- Name: region_country region_country_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."region_country"
    ADD CONSTRAINT "region_country_pkey" PRIMARY KEY ("iso_2");


--
-- Name: region_payment_provider region_payment_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."region_payment_provider"
    ADD CONSTRAINT "region_payment_provider_pkey" PRIMARY KEY ("region_id", "payment_provider_id");


--
-- Name: region region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."region"
    ADD CONSTRAINT "region_pkey" PRIMARY KEY ("id");


--
-- Name: reservation_item reservation_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."reservation_item"
    ADD CONSTRAINT "reservation_item_pkey" PRIMARY KEY ("id");


--
-- Name: return_fulfillment return_fulfillment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return_fulfillment"
    ADD CONSTRAINT "return_fulfillment_pkey" PRIMARY KEY ("return_id", "fulfillment_id");


--
-- Name: return_item return_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return_item"
    ADD CONSTRAINT "return_item_pkey" PRIMARY KEY ("id");


--
-- Name: return return_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return"
    ADD CONSTRAINT "return_pkey" PRIMARY KEY ("id");


--
-- Name: return_reason return_reason_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return_reason"
    ADD CONSTRAINT "return_reason_pkey" PRIMARY KEY ("id");


--
-- Name: sales_channel sales_channel_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."sales_channel"
    ADD CONSTRAINT "sales_channel_pkey" PRIMARY KEY ("id");


--
-- Name: sales_channel_stock_location sales_channel_stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."sales_channel_stock_location"
    ADD CONSTRAINT "sales_channel_stock_location_pkey" PRIMARY KEY ("sales_channel_id", "stock_location_id");


--
-- Name: script_migrations script_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."script_migrations"
    ADD CONSTRAINT "script_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: search_index search_index_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_index"
    ADD CONSTRAINT "search_index_pkey" PRIMARY KEY ("id");


--
-- Name: search_index_sync search_index_sync_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_index_sync"
    ADD CONSTRAINT "search_index_sync_pkey" PRIMARY KEY ("id");


--
-- Name: search_index_version search_index_version_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_index_version"
    ADD CONSTRAINT "search_index_version_pkey" PRIMARY KEY ("id");


--
-- Name: search_postgres_index search_postgres_index_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_postgres_index"
    ADD CONSTRAINT "search_postgres_index_pkey" PRIMARY KEY ("name");


--
-- Name: service_zone service_zone_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."service_zone"
    ADD CONSTRAINT "service_zone_pkey" PRIMARY KEY ("id");


--
-- Name: shipping_option shipping_option_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option"
    ADD CONSTRAINT "shipping_option_pkey" PRIMARY KEY ("id");


--
-- Name: shipping_option_price_set shipping_option_price_set_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option_price_set"
    ADD CONSTRAINT "shipping_option_price_set_pkey" PRIMARY KEY ("shipping_option_id", "price_set_id");


--
-- Name: shipping_option_rule shipping_option_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option_rule"
    ADD CONSTRAINT "shipping_option_rule_pkey" PRIMARY KEY ("id");


--
-- Name: shipping_option_type shipping_option_type_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option_type"
    ADD CONSTRAINT "shipping_option_type_pkey" PRIMARY KEY ("id");


--
-- Name: shipping_profile shipping_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_profile"
    ADD CONSTRAINT "shipping_profile_pkey" PRIMARY KEY ("id");


--
-- Name: stock_location_address stock_location_address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."stock_location_address"
    ADD CONSTRAINT "stock_location_address_pkey" PRIMARY KEY ("id");


--
-- Name: stock_location stock_location_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."stock_location"
    ADD CONSTRAINT "stock_location_pkey" PRIMARY KEY ("id");


--
-- Name: store_currency store_currency_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."store_currency"
    ADD CONSTRAINT "store_currency_pkey" PRIMARY KEY ("id");


--
-- Name: store_locale store_locale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."store_locale"
    ADD CONSTRAINT "store_locale_pkey" PRIMARY KEY ("id");


--
-- Name: store store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."store"
    ADD CONSTRAINT "store_pkey" PRIMARY KEY ("id");


--
-- Name: tax_provider tax_provider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_provider"
    ADD CONSTRAINT "tax_provider_pkey" PRIMARY KEY ("id");


--
-- Name: tax_rate tax_rate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_rate"
    ADD CONSTRAINT "tax_rate_pkey" PRIMARY KEY ("id");


--
-- Name: tax_rate_rule tax_rate_rule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_rate_rule"
    ADD CONSTRAINT "tax_rate_rule_pkey" PRIMARY KEY ("id");


--
-- Name: tax_region tax_region_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_region"
    ADD CONSTRAINT "tax_region_pkey" PRIMARY KEY ("id");


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");


--
-- Name: user_preference user_preference_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_preference"
    ADD CONSTRAINT "user_preference_pkey" PRIMARY KEY ("id");


--
-- Name: user_rbac_role user_rbac_role_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."user_rbac_role"
    ADD CONSTRAINT "user_rbac_role_pkey" PRIMARY KEY ("user_id", "rbac_role_id");


--
-- Name: view_configuration view_configuration_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."view_configuration"
    ADD CONSTRAINT "view_configuration_pkey" PRIMARY KEY ("id");


--
-- Name: workflow_execution workflow_execution_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."workflow_execution"
    ADD CONSTRAINT "workflow_execution_pkey" PRIMARY KEY ("workflow_id", "transaction_id", "run_id");


--
-- Name: IDX_account_holder_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_account_holder_deleted_at" ON "public"."account_holder" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_account_holder_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_account_holder_id_5cb3a0c0" ON "public"."customer_account_holder" USING "btree" ("account_holder_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_account_holder_provider_id_external_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_account_holder_provider_id_external_id_unique" ON "public"."account_holder" USING "btree" ("provider_id", "external_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_api_key_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_deleted_at" ON "public"."api_key" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_api_key_redacted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_redacted" ON "public"."api_key" USING "btree" ("redacted") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_api_key_revoked_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_revoked_at" ON "public"."api_key" USING "btree" ("revoked_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_api_key_token_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_api_key_token_unique" ON "public"."api_key" USING "btree" ("token");


--
-- Name: IDX_api_key_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_api_key_type" ON "public"."api_key" USING "btree" ("type");


--
-- Name: IDX_application_method_allocation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_allocation" ON "public"."promotion_application_method" USING "btree" ("allocation");


--
-- Name: IDX_application_method_target_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_target_type" ON "public"."promotion_application_method" USING "btree" ("target_type");


--
-- Name: IDX_application_method_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_application_method_type" ON "public"."promotion_application_method" USING "btree" ("type");


--
-- Name: IDX_auth_identity_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_identity_deleted_at" ON "public"."auth_identity" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_factor_auth_identity_id" ON "public"."auth_mfa_factor" USING "btree" ("auth_identity_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_mfa_factor_auth_identity_provider_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_mfa_factor_auth_identity_provider_active" ON "public"."auth_mfa_factor" USING "btree" ("auth_identity_id", "provider") WHERE (("deleted_at" IS NULL) AND ("status" = ANY (ARRAY['pending'::"text", 'enabled'::"text"])));


--
-- Name: IDX_auth_mfa_factor_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_factor_deleted_at" ON "public"."auth_mfa_factor" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_code_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_mfa_recovery_code_auth_identity_code_hash" ON "public"."auth_mfa_recovery_code" USING "btree" ("auth_identity_id", "code_hash") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_recovery_code_auth_identity_id" ON "public"."auth_mfa_recovery_code" USING "btree" ("auth_identity_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_mfa_recovery_code_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_mfa_recovery_code_deleted_at" ON "public"."auth_mfa_recovery_code" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_password_reset_token_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_auth_identity_id" ON "public"."auth_password_reset_token" USING "btree" ("auth_identity_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_password_reset_token_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_deleted_at" ON "public"."auth_password_reset_token" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_password_reset_token_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_expires_at" ON "public"."auth_password_reset_token" USING "btree" ("expires_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_password_reset_token_provider_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_provider_identity_id" ON "public"."auth_password_reset_token" USING "btree" ("provider_identity_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_password_reset_token_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_password_reset_token_token_hash" ON "public"."auth_password_reset_token" USING "btree" ("token_hash") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_verification_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_verification_auth_identity_id" ON "public"."auth_verification" USING "btree" ("auth_identity_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_verification_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_auth_verification_deleted_at" ON "public"."auth_verification" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_auth_verification_unique_auth_identity_entity_id_entity_typ; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_auth_verification_unique_auth_identity_entity_id_entity_typ" ON "public"."auth_verification" USING "btree" ("auth_identity_id", "entity_id", "entity_type") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_campaign_budget_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_campaign_budget_type" ON "public"."promotion_campaign_budget" USING "btree" ("type");


--
-- Name: IDX_capture_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_capture_deleted_at" ON "public"."capture" USING "btree" ("deleted_at");


--
-- Name: IDX_capture_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_capture_payment_id" ON "public"."capture" USING "btree" ("payment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_address_deleted_at" ON "public"."cart_address" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_billing_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_billing_address_id" ON "public"."cart" USING "btree" ("billing_address_id") WHERE (("deleted_at" IS NULL) AND ("billing_address_id" IS NOT NULL));


--
-- Name: IDX_cart_credit_line_reference_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_credit_line_reference_reference_id" ON "public"."credit_line" USING "btree" ("reference", "reference_id") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_currency_code" ON "public"."cart" USING "btree" ("currency_code");


--
-- Name: IDX_cart_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_customer_id" ON "public"."cart" USING "btree" ("customer_id") WHERE (("deleted_at" IS NULL) AND ("customer_id" IS NOT NULL));


--
-- Name: IDX_cart_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_deleted_at" ON "public"."cart" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-4a39f6c9" ON "public"."cart_payment_collection" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-71069c16" ON "public"."order_cart" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_id_-a9d4a70b" ON "public"."cart_promotion" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_line_item_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_adjustment_deleted_at" ON "public"."cart_line_item_adjustment" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_adjustment_item_id" ON "public"."cart_line_item_adjustment" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_line_item_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_cart_id" ON "public"."cart_line_item" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_line_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_deleted_at" ON "public"."cart_line_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_tax_line_deleted_at" ON "public"."cart_line_item_tax_line" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_line_item_tax_line_item_id" ON "public"."cart_line_item_tax_line" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_region_id" ON "public"."cart" USING "btree" ("region_id") WHERE (("deleted_at" IS NULL) AND ("region_id" IS NOT NULL));


--
-- Name: IDX_cart_sales_channel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_sales_channel_id" ON "public"."cart" USING "btree" ("sales_channel_id") WHERE (("deleted_at" IS NULL) AND ("sales_channel_id" IS NOT NULL));


--
-- Name: IDX_cart_shipping_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_address_id" ON "public"."cart" USING "btree" ("shipping_address_id") WHERE (("deleted_at" IS NULL) AND ("shipping_address_id" IS NOT NULL));


--
-- Name: IDX_cart_shipping_method_adjustment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_deleted_at" ON "public"."cart_shipping_method_adjustment" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_adjustment_shipping_method_id" ON "public"."cart_shipping_method_adjustment" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_shipping_method_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_cart_id" ON "public"."cart_shipping_method" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_cart_shipping_method_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_deleted_at" ON "public"."cart_shipping_method" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_deleted_at" ON "public"."cart_shipping_method_tax_line" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_cart_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_cart_shipping_method_tax_line_shipping_method_id" ON "public"."cart_shipping_method_tax_line" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_category_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_category_handle_unique" ON "public"."product_category" USING "btree" ("handle") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_collection_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_collection_handle_unique" ON "public"."product_collection" USING "btree" ("handle") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_credit_line_cart_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_credit_line_cart_id" ON "public"."credit_line" USING "btree" ("cart_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_credit_line_deleted_at" ON "public"."credit_line" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_address_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_address_customer_id" ON "public"."customer_address" USING "btree" ("customer_id");


--
-- Name: IDX_customer_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_address_deleted_at" ON "public"."customer_address" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_address_unique_customer_billing; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_billing" ON "public"."customer_address" USING "btree" ("customer_id") WHERE ("is_default_billing" = true);


--
-- Name: IDX_customer_address_unique_customer_shipping; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_address_unique_customer_shipping" ON "public"."customer_address" USING "btree" ("customer_id") WHERE ("is_default_shipping" = true);


--
-- Name: IDX_customer_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_deleted_at" ON "public"."customer" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_email_has_account_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_email_has_account_unique" ON "public"."customer" USING "btree" ("email", "has_account") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_group_customer_customer_group_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_customer_group_id" ON "public"."customer_group_customer" USING "btree" ("customer_group_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_group_customer_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_customer_id" ON "public"."customer_group_customer" USING "btree" ("customer_id");


--
-- Name: IDX_customer_group_customer_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_customer_deleted_at" ON "public"."customer_group_customer" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_group_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_group_deleted_at" ON "public"."customer_group" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_group_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_customer_group_name_unique" ON "public"."customer_group" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_customer_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_customer_id_5cb3a0c0" ON "public"."customer_account_holder" USING "btree" ("customer_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_deleted_at_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-1d67bae40" ON "public"."publishable_api_key_sales_channel" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-1e5992737" ON "public"."location_fulfillment_provider" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-31ea43a" ON "public"."return_fulfillment" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-4a39f6c9" ON "public"."cart_payment_collection" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-71069c16" ON "public"."order_cart" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-71518339" ON "public"."order_promotion" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-85069d44" ON "public"."invite_rbac_role" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-a9d4a70b" ON "public"."cart_promotion" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-e88adb96" ON "public"."location_fulfillment_set" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_-e8d2543e" ON "public"."order_fulfillment" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_17a262437" ON "public"."product_shipping_profile" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_17b4c4e35" ON "public"."product_variant_inventory_item" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_1c934dab0" ON "public"."region_payment_provider" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_20b454295" ON "public"."product_sales_channel" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_26d06f470" ON "public"."sales_channel_stock_location" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_52b23597" ON "public"."product_variant_price_set" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_5cb3a0c0" ON "public"."customer_account_holder" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_64ff0c4c" ON "public"."user_rbac_role" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_ba32fa9c" ON "public"."shipping_option_price_set" USING "btree" ("deleted_at");


--
-- Name: IDX_deleted_at_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_deleted_at_f42b9949" ON "public"."order_payment_collection" USING "btree" ("deleted_at");


--
-- Name: IDX_fulfillment_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_address_deleted_at" ON "public"."fulfillment_address" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_fulfillment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_deleted_at" ON "public"."fulfillment" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_fulfillment_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_id_-31ea43a" ON "public"."return_fulfillment" USING "btree" ("fulfillment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_id_-e8d2543e" ON "public"."order_fulfillment" USING "btree" ("fulfillment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_deleted_at" ON "public"."fulfillment_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_fulfillment_item_fulfillment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_fulfillment_id" ON "public"."fulfillment_item" USING "btree" ("fulfillment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_item_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_inventory_item_id" ON "public"."fulfillment_item" USING "btree" ("inventory_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_item_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_item_line_item_id" ON "public"."fulfillment_item" USING "btree" ("line_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_label_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_label_deleted_at" ON "public"."fulfillment_label" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_fulfillment_label_fulfillment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_label_fulfillment_id" ON "public"."fulfillment_label" USING "btree" ("fulfillment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_location_id" ON "public"."fulfillment" USING "btree" ("location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_provider_deleted_at" ON "public"."fulfillment_provider" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_provider_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_provider_id_-1e5992737" ON "public"."location_fulfillment_provider" USING "btree" ("fulfillment_provider_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_set_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_set_deleted_at" ON "public"."fulfillment_set" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_fulfillment_set_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_set_id_-e88adb96" ON "public"."location_fulfillment_set" USING "btree" ("fulfillment_set_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_set_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_fulfillment_set_name_unique" ON "public"."fulfillment_set" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_fulfillment_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_fulfillment_shipping_option_id" ON "public"."fulfillment" USING "btree" ("shipping_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_geo_zone_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_city" ON "public"."geo_zone" USING "btree" ("city") WHERE (("deleted_at" IS NULL) AND ("city" IS NOT NULL));


--
-- Name: IDX_geo_zone_country_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_country_code" ON "public"."geo_zone" USING "btree" ("country_code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_geo_zone_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_deleted_at" ON "public"."geo_zone" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_geo_zone_province_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_province_code" ON "public"."geo_zone" USING "btree" ("province_code") WHERE (("deleted_at" IS NULL) AND ("province_code" IS NOT NULL));


--
-- Name: IDX_geo_zone_service_zone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_geo_zone_service_zone_id" ON "public"."geo_zone" USING "btree" ("service_zone_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-1d67bae40" ON "public"."publishable_api_key_sales_channel" USING "btree" ("id");


--
-- Name: IDX_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-1e5992737" ON "public"."location_fulfillment_provider" USING "btree" ("id");


--
-- Name: IDX_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-31ea43a" ON "public"."return_fulfillment" USING "btree" ("id");


--
-- Name: IDX_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-4a39f6c9" ON "public"."cart_payment_collection" USING "btree" ("id");


--
-- Name: IDX_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-71069c16" ON "public"."order_cart" USING "btree" ("id");


--
-- Name: IDX_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-71518339" ON "public"."order_promotion" USING "btree" ("id");


--
-- Name: IDX_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-85069d44" ON "public"."invite_rbac_role" USING "btree" ("id");


--
-- Name: IDX_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-a9d4a70b" ON "public"."cart_promotion" USING "btree" ("id");


--
-- Name: IDX_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-e88adb96" ON "public"."location_fulfillment_set" USING "btree" ("id");


--
-- Name: IDX_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_-e8d2543e" ON "public"."order_fulfillment" USING "btree" ("id");


--
-- Name: IDX_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_17a262437" ON "public"."product_shipping_profile" USING "btree" ("id");


--
-- Name: IDX_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_17b4c4e35" ON "public"."product_variant_inventory_item" USING "btree" ("id");


--
-- Name: IDX_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_1c934dab0" ON "public"."region_payment_provider" USING "btree" ("id");


--
-- Name: IDX_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_20b454295" ON "public"."product_sales_channel" USING "btree" ("id");


--
-- Name: IDX_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_26d06f470" ON "public"."sales_channel_stock_location" USING "btree" ("id");


--
-- Name: IDX_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_52b23597" ON "public"."product_variant_price_set" USING "btree" ("id");


--
-- Name: IDX_id_5cb3a0c0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_5cb3a0c0" ON "public"."customer_account_holder" USING "btree" ("id");


--
-- Name: IDX_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_64ff0c4c" ON "public"."user_rbac_role" USING "btree" ("id");


--
-- Name: IDX_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_ba32fa9c" ON "public"."shipping_option_price_set" USING "btree" ("id");


--
-- Name: IDX_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_id_f42b9949" ON "public"."order_payment_collection" USING "btree" ("id");


--
-- Name: IDX_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_image_deleted_at" ON "public"."image" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_image_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_image_product_id" ON "public"."image" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_inventory_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_item_deleted_at" ON "public"."inventory_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_inventory_item_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_item_id_17b4c4e35" ON "public"."product_variant_inventory_item" USING "btree" ("inventory_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_inventory_item_sku; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_inventory_item_sku" ON "public"."inventory_item" USING "btree" ("sku") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_inventory_level_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_deleted_at" ON "public"."inventory_level" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_inventory_level_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_inventory_item_id" ON "public"."inventory_level" USING "btree" ("inventory_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_inventory_level_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_inventory_level_location_id" ON "public"."inventory_level" USING "btree" ("location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_inventory_level_location_id_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_inventory_level_location_id_inventory_item_id" ON "public"."inventory_level" USING "btree" ("inventory_item_id", "location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_invite_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_deleted_at" ON "public"."invite" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_invite_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_invite_email_unique" ON "public"."invite" USING "btree" ("email") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_invite_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_id_-85069d44" ON "public"."invite_rbac_role" USING "btree" ("invite_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_invite_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_invite_token" ON "public"."invite" USING "btree" ("token") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_layout_configuration_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_layout_configuration_deleted_at" ON "public"."layout_configuration" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_layout_configuration_zone_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_layout_configuration_zone_unique" ON "public"."layout_configuration" USING "btree" ("zone") WHERE (("is_system_default" = true) AND ("deleted_at" IS NULL));


--
-- Name: IDX_layout_configuration_zone_user_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_layout_configuration_zone_user_id_unique" ON "public"."layout_configuration" USING "btree" ("zone", "user_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_line_item_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_adjustment_promotion_id" ON "public"."cart_line_item_adjustment" USING "btree" ("promotion_id") WHERE (("deleted_at" IS NULL) AND ("promotion_id" IS NOT NULL));


--
-- Name: IDX_line_item_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_product_id" ON "public"."cart_line_item" USING "btree" ("product_id") WHERE (("deleted_at" IS NULL) AND ("product_id" IS NOT NULL));


--
-- Name: IDX_line_item_product_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_product_type_id" ON "public"."order_line_item" USING "btree" ("product_type_id") WHERE (("deleted_at" IS NULL) AND ("product_type_id" IS NOT NULL));


--
-- Name: IDX_line_item_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_tax_line_tax_rate_id" ON "public"."cart_line_item_tax_line" USING "btree" ("tax_rate_id") WHERE (("deleted_at" IS NULL) AND ("tax_rate_id" IS NOT NULL));


--
-- Name: IDX_line_item_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_line_item_variant_id" ON "public"."cart_line_item" USING "btree" ("variant_id") WHERE (("deleted_at" IS NULL) AND ("variant_id" IS NOT NULL));


--
-- Name: IDX_notification_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_deleted_at" ON "public"."notification" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_notification_idempotency_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_notification_idempotency_key_unique" ON "public"."notification" USING "btree" ("idempotency_key") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_notification_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_provider_deleted_at" ON "public"."notification_provider" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_notification_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_provider_id" ON "public"."notification" USING "btree" ("provider_id");


--
-- Name: IDX_notification_receiver_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_notification_receiver_id" ON "public"."notification" USING "btree" ("receiver_id");


--
-- Name: IDX_option_value_option_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_option_value_option_id_unique" ON "public"."product_option_value" USING "btree" ("option_id", "value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_address_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_address_customer_id" ON "public"."order_address" USING "btree" ("customer_id");


--
-- Name: IDX_order_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_address_deleted_at" ON "public"."order_address" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_billing_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_billing_address_id" ON "public"."order" USING "btree" ("billing_address_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_action_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_claim_id" ON "public"."order_change_action" USING "btree" ("claim_id") WHERE (("claim_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_action_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_deleted_at" ON "public"."order_change_action" USING "btree" ("deleted_at");


--
-- Name: IDX_order_change_action_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_exchange_id" ON "public"."order_change_action" USING "btree" ("exchange_id") WHERE (("exchange_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_action_order_change_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_order_change_id" ON "public"."order_change_action" USING "btree" ("order_change_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_action_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_order_id" ON "public"."order_change_action" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_action_ordering; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_ordering" ON "public"."order_change_action" USING "btree" ("ordering") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_action_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_action_return_id" ON "public"."order_change_action" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_change_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_change_type" ON "public"."order_change" USING "btree" ("change_type");


--
-- Name: IDX_order_change_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_claim_id" ON "public"."order_change" USING "btree" ("claim_id") WHERE (("claim_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_deleted_at" ON "public"."order_change" USING "btree" ("deleted_at");


--
-- Name: IDX_order_change_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_exchange_id" ON "public"."order_change" USING "btree" ("exchange_id") WHERE (("exchange_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_order_id" ON "public"."order_change" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_order_id_version" ON "public"."order_change" USING "btree" ("order_id", "version");


--
-- Name: IDX_order_change_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_return_id" ON "public"."order_change" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_change_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_status" ON "public"."order_change" USING "btree" ("status") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_change_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_change_version" ON "public"."order_change" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_deleted_at" ON "public"."order_claim" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_display_id" ON "public"."order_claim" USING "btree" ("display_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_item_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_claim_id" ON "public"."order_claim_item" USING "btree" ("claim_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_deleted_at" ON "public"."order_claim_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_item_image_claim_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_image_claim_item_id" ON "public"."order_claim_item_image" USING "btree" ("claim_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_item_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_image_deleted_at" ON "public"."order_claim_item_image" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_order_claim_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_item_item_id" ON "public"."order_claim_item" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_order_id" ON "public"."order_claim" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_claim_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_claim_return_id" ON "public"."order_claim" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_credit_line_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_deleted_at" ON "public"."order_credit_line" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_order_credit_line_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_order_id" ON "public"."order_credit_line" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_credit_line_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_credit_line_order_id_version" ON "public"."order_credit_line" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_currency_code" ON "public"."order" USING "btree" ("currency_code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_custom_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_order_custom_display_id" ON "public"."order" USING "btree" ("custom_display_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_customer_id" ON "public"."order" USING "btree" ("customer_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_deleted_at" ON "public"."order" USING "btree" ("deleted_at");


--
-- Name: IDX_order_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_display_id" ON "public"."order" USING "btree" ("display_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_deleted_at" ON "public"."order_exchange" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_display_id" ON "public"."order_exchange" USING "btree" ("display_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_deleted_at" ON "public"."order_exchange_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_item_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_exchange_id" ON "public"."order_exchange_item" USING "btree" ("exchange_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_item_item_id" ON "public"."order_exchange_item" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_order_id" ON "public"."order_exchange" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_exchange_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_exchange_return_id" ON "public"."order_exchange" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_id_-71069c16; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-71069c16" ON "public"."order_cart" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-71518339" ON "public"."order_promotion" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_id_-e8d2543e; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_-e8d2543e" ON "public"."order_fulfillment" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_id_f42b9949" ON "public"."order_payment_collection" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_is_draft_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_is_draft_order" ON "public"."order" USING "btree" ("is_draft_order") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_deleted_at" ON "public"."order_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_order_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_item_id" ON "public"."order_item" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_item_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_order_id" ON "public"."order_item" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_item_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_item_order_id_version" ON "public"."order_item" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_line_item_adjustment_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_adjustment_item_id" ON "public"."order_line_item_adjustment" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_line_item_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_product_id" ON "public"."order_line_item" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_line_item_tax_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_tax_line_item_id" ON "public"."order_line_item_tax_line" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_line_item_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_line_item_variant_id" ON "public"."order_line_item" USING "btree" ("variant_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_region_id" ON "public"."order" USING "btree" ("region_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_sales_channel_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_sales_channel_id" ON "public"."order" USING "btree" ("sales_channel_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_address_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_address_id" ON "public"."order" USING "btree" ("shipping_address_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_claim_id" ON "public"."order_shipping" USING "btree" ("claim_id") WHERE (("claim_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_shipping_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_deleted_at" ON "public"."order_shipping" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_order_shipping_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_exchange_id" ON "public"."order_shipping" USING "btree" ("exchange_id") WHERE (("exchange_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_shipping_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_item_id" ON "public"."order_shipping" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_adjustment_shipping_method_id" ON "public"."order_shipping_method_adjustment" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_method_adjustment_version_shipping_method; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_order_shipping_method_adjustment_version_shipping_method" ON "public"."order_shipping_method_adjustment" USING "btree" ("version", "shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_method_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_shipping_option_id" ON "public"."order_shipping_method" USING "btree" ("shipping_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_method_tax_line_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_method_tax_line_shipping_method_id" ON "public"."order_shipping_method_tax_line" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_order_id" ON "public"."order_shipping" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_order_id_version" ON "public"."order_shipping" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_shipping_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_return_id" ON "public"."order_shipping" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_shipping_shipping_method_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_shipping_shipping_method_id" ON "public"."order_shipping" USING "btree" ("shipping_method_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_summary_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_summary_deleted_at" ON "public"."order_summary" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_order_summary_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_summary_order_id_version" ON "public"."order_summary" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_transaction_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_claim_id" ON "public"."order_transaction" USING "btree" ("claim_id") WHERE (("claim_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_transaction_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_currency_code" ON "public"."order_transaction" USING "btree" ("currency_code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_transaction_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_exchange_id" ON "public"."order_transaction" USING "btree" ("exchange_id") WHERE (("exchange_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_order_transaction_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_order_id" ON "public"."order_transaction" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_transaction_order_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_order_id_version" ON "public"."order_transaction" USING "btree" ("order_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_transaction_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_reference_id" ON "public"."order_transaction" USING "btree" ("reference_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_order_transaction_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_order_transaction_return_id" ON "public"."order_transaction" USING "btree" ("return_id") WHERE (("return_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_payment_collection_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_deleted_at" ON "public"."payment_collection" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_payment_collection_id_-4a39f6c9; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_id_-4a39f6c9" ON "public"."cart_payment_collection" USING "btree" ("payment_collection_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_collection_id_f42b9949; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_collection_id_f42b9949" ON "public"."order_payment_collection" USING "btree" ("payment_collection_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_deleted_at" ON "public"."payment" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_payment_payment_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_payment_collection_id" ON "public"."payment" USING "btree" ("payment_collection_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_payment_session_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_payment_session_id" ON "public"."payment" USING "btree" ("payment_session_id");


--
-- Name: IDX_payment_payment_session_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_payment_payment_session_id_unique" ON "public"."payment" USING "btree" ("payment_session_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_deleted_at" ON "public"."payment_provider" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_id" ON "public"."payment" USING "btree" ("provider_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_provider_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_provider_id_1c934dab0" ON "public"."region_payment_provider" USING "btree" ("payment_provider_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_payment_session_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_session_deleted_at" ON "public"."payment_session" USING "btree" ("deleted_at");


--
-- Name: IDX_payment_session_payment_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_payment_session_payment_collection_id" ON "public"."payment_session" USING "btree" ("payment_collection_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_currency_code" ON "public"."price" USING "btree" ("currency_code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_deleted_at" ON "public"."price" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_list_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_deleted_at" ON "public"."price_list" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_list_id_status_starts_at_ends_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_id_status_starts_at_ends_at" ON "public"."price_list" USING "btree" ("id", "status", "starts_at", "ends_at") WHERE (("deleted_at" IS NULL) AND ("status" = 'active'::"text"));


--
-- Name: IDX_price_list_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_attribute" ON "public"."price_list_rule" USING "btree" ("attribute") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_list_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_deleted_at" ON "public"."price_list_rule" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_list_rule_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_price_list_id" ON "public"."price_list_rule" USING "btree" ("price_list_id") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_list_rule_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_list_rule_value" ON "public"."price_list_rule" USING "gin" ("value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_preference_attribute_value; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_price_preference_attribute_value" ON "public"."price_preference" USING "btree" ("attribute", "value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_preference_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_preference_deleted_at" ON "public"."price_preference" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_price_list_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_price_list_id" ON "public"."price" USING "btree" ("price_list_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_price_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_price_set_id" ON "public"."price" USING "btree" ("price_set_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute" ON "public"."price_rule" USING "btree" ("attribute") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_attribute_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute_value" ON "public"."price_rule" USING "btree" ("attribute", "value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_attribute_value_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_attribute_value_price_id" ON "public"."price_rule" USING "btree" ("attribute", "value", "price_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_deleted_at" ON "public"."price_rule" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_rule_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_operator" ON "public"."price_rule" USING "btree" ("operator");


--
-- Name: IDX_price_rule_operator_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_operator_value" ON "public"."price_rule" USING "btree" ("operator", "value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_price_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_rule_price_id" ON "public"."price_rule" USING "btree" ("price_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_rule_price_id_attribute_operator_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_price_rule_price_id_attribute_operator_unique" ON "public"."price_rule" USING "btree" ("price_id", "attribute", "operator") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_set_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_deleted_at" ON "public"."price_set" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_price_set_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_id_52b23597" ON "public"."product_variant_price_set" USING "btree" ("price_set_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_price_set_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_price_set_id_ba32fa9c" ON "public"."shipping_option_price_set" USING "btree" ("price_set_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_category_parent_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_category_parent_category_id" ON "public"."product_category" USING "btree" ("parent_category_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_category_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_category_path" ON "public"."product_category" USING "btree" ("mpath") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_collection_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_collection_deleted_at" ON "public"."product_collection" USING "btree" ("deleted_at");


--
-- Name: IDX_product_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_collection_id" ON "public"."product" USING "btree" ("collection_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_deleted_at" ON "public"."product" USING "btree" ("deleted_at");


--
-- Name: IDX_product_handle_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_handle_unique" ON "public"."product" USING "btree" ("handle") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_id_17a262437" ON "public"."product_shipping_profile" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_id_20b454295" ON "public"."product_sales_channel" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_image_rank; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_rank" ON "public"."image" USING "btree" ("rank") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_image_rank_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_rank_product_id" ON "public"."image" USING "btree" ("rank", "product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_image_url; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_url" ON "public"."image" USING "btree" ("url") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_image_url_rank_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_image_url_rank_product_id" ON "public"."image" USING "btree" ("url", "rank", "product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_deleted_at" ON "public"."product_option" USING "btree" ("deleted_at");


--
-- Name: IDX_product_option_global_title_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_option_global_title_unique" ON "public"."product_option" USING "btree" ("title") WHERE (("deleted_at" IS NULL) AND ("is_exclusive" = false));


--
-- Name: IDX_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_value_deleted_at" ON "public"."product_option_value" USING "btree" ("deleted_at");


--
-- Name: IDX_product_option_value_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_option_value_option_id" ON "public"."product_option_value" USING "btree" ("option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_deleted_at" ON "public"."product_product_option" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_product_id" ON "public"."product_product_option" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_product_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_product_option_id" ON "public"."product_product_option" USING "btree" ("product_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_deleted_at" ON "public"."product_product_option_value" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_value_product_option_value_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_product_option_value_id" ON "public"."product_product_option_value" USING "btree" ("product_option_value_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_value_product_product_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_product_product_option_id" ON "public"."product_product_option_value" USING "btree" ("product_product_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_product_option_value_product_product_option_id_fk; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_product_option_value_product_product_option_id_fk" ON "public"."product_product_option_value" USING "btree" ("product_product_option_id");


--
-- Name: IDX_product_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_status" ON "public"."product" USING "btree" ("status") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_tag_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_tag_deleted_at" ON "public"."product_tag" USING "btree" ("deleted_at");


--
-- Name: IDX_product_type_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_type_deleted_at" ON "public"."product_type" USING "btree" ("deleted_at");


--
-- Name: IDX_product_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_type_id" ON "public"."product" USING "btree" ("type_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_barcode_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_barcode_unique" ON "public"."product_variant" USING "btree" ("barcode") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_deleted_at" ON "public"."product_variant" USING "btree" ("deleted_at");


--
-- Name: IDX_product_variant_ean_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_ean_unique" ON "public"."product_variant" USING "btree" ("ean") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_id_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_id_product_id" ON "public"."product_variant" USING "btree" ("id", "product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_id" ON "public"."product_variant" USING "btree" ("product_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_product_image_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_deleted_at" ON "public"."product_variant_product_image" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_product_image_image_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_image_id" ON "public"."product_variant_product_image" USING "btree" ("image_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_product_image_variant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_product_variant_product_image_variant_id" ON "public"."product_variant_product_image" USING "btree" ("variant_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_sku_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_sku_unique" ON "public"."product_variant" USING "btree" ("sku") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_product_variant_upc_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_product_variant_upc_unique" ON "public"."product_variant" USING "btree" ("upc") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_application_method_currency_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_application_method_currency_code" ON "public"."promotion_application_method" USING "btree" ("currency_code") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_promotion_application_method_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_application_method_deleted_at" ON "public"."promotion_application_method" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_application_method_promotion_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_application_method_promotion_id_unique" ON "public"."promotion_application_method" USING "btree" ("promotion_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_budget_campaign_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_campaign_id_unique" ON "public"."promotion_campaign_budget" USING "btree" ("campaign_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_budget_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_deleted_at" ON "public"."promotion_campaign_budget" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_budget_usage_attribute_value_budget_id_u" ON "public"."promotion_campaign_budget_usage" USING "btree" ("attribute_value", "budget_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_budget_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_budget_id" ON "public"."promotion_campaign_budget_usage" USING "btree" ("budget_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_budget_usage_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_budget_usage_deleted_at" ON "public"."promotion_campaign_budget_usage" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_campaign_identifier_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_promotion_campaign_campaign_identifier_unique" ON "public"."promotion_campaign" USING "btree" ("campaign_identifier") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_deleted_at" ON "public"."promotion_campaign" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_campaign_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_campaign_id" ON "public"."promotion" USING "btree" ("campaign_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_deleted_at" ON "public"."promotion" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_id_-71518339; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_id_-71518339" ON "public"."order_promotion" USING "btree" ("promotion_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_id_-a9d4a70b; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_id_-a9d4a70b" ON "public"."cart_promotion" USING "btree" ("promotion_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_is_automatic; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_is_automatic" ON "public"."promotion" USING "btree" ("is_automatic") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_attribute; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute" ON "public"."promotion_rule" USING "btree" ("attribute");


--
-- Name: IDX_promotion_rule_attribute_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute_operator" ON "public"."promotion_rule" USING "btree" ("attribute", "operator") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_attribute_operator_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_attribute_operator_id" ON "public"."promotion_rule" USING "btree" ("operator", "attribute", "id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_deleted_at" ON "public"."promotion_rule" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_operator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_operator" ON "public"."promotion_rule" USING "btree" ("operator");


--
-- Name: IDX_promotion_rule_value_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_deleted_at" ON "public"."promotion_rule_value" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_value_promotion_rule_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_promotion_rule_id" ON "public"."promotion_rule_value" USING "btree" ("promotion_rule_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_value_rule_id_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_rule_id_value" ON "public"."promotion_rule_value" USING "btree" ("promotion_rule_id", "value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_rule_value_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_rule_value_value" ON "public"."promotion_rule_value" USING "btree" ("value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_status" ON "public"."promotion" USING "btree" ("status") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_promotion_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_promotion_type" ON "public"."promotion" USING "btree" ("type");


--
-- Name: IDX_property_label_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_property_label_deleted_at" ON "public"."property_label" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_property_label_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_property_label_entity" ON "public"."property_label" USING "btree" ("entity") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_property_label_entity_property_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_property_label_entity_property_unique" ON "public"."property_label" USING "btree" ("entity", "property") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_provider_identity_auth_identity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_provider_identity_auth_identity_id" ON "public"."provider_identity" USING "btree" ("auth_identity_id");


--
-- Name: IDX_provider_identity_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_provider_identity_deleted_at" ON "public"."provider_identity" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_provider_identity_provider_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_provider_identity_provider_entity_id" ON "public"."provider_identity" USING "btree" ("entity_id", "provider");


--
-- Name: IDX_publishable_key_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_publishable_key_id_-1d67bae40" ON "public"."publishable_api_key_sales_channel" USING "btree" ("publishable_key_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_rbac_role_id_-85069d44; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_rbac_role_id_-85069d44" ON "public"."invite_rbac_role" USING "btree" ("rbac_role_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_rbac_role_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_rbac_role_id_64ff0c4c" ON "public"."user_rbac_role" USING "btree" ("rbac_role_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_refund_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_deleted_at" ON "public"."refund" USING "btree" ("deleted_at");


--
-- Name: IDX_refund_payment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_payment_id" ON "public"."refund" USING "btree" ("payment_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_refund_reason_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_reason_deleted_at" ON "public"."refund_reason" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_refund_refund_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_refund_refund_reason_id" ON "public"."refund" USING "btree" ("refund_reason_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_region_country_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_country_deleted_at" ON "public"."region_country" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_region_country_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_country_region_id" ON "public"."region_country" USING "btree" ("region_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_region_country_region_id_iso_2_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_region_country_region_id_iso_2_unique" ON "public"."region_country" USING "btree" ("region_id", "iso_2");


--
-- Name: IDX_region_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_deleted_at" ON "public"."region" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_region_id_1c934dab0; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_region_id_1c934dab0" ON "public"."region_payment_provider" USING "btree" ("region_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_reservation_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_deleted_at" ON "public"."reservation_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_reservation_item_inventory_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_inventory_item_id" ON "public"."reservation_item" USING "btree" ("inventory_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_reservation_item_line_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_line_item_id" ON "public"."reservation_item" USING "btree" ("line_item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_reservation_item_location_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_reservation_item_location_id" ON "public"."reservation_item" USING "btree" ("location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_claim_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_claim_id" ON "public"."return" USING "btree" ("claim_id") WHERE (("claim_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_return_display_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_display_id" ON "public"."return" USING "btree" ("display_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_exchange_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_exchange_id" ON "public"."return" USING "btree" ("exchange_id") WHERE (("exchange_id" IS NOT NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_return_id_-31ea43a; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_id_-31ea43a" ON "public"."return_fulfillment" USING "btree" ("return_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_item_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_deleted_at" ON "public"."return_item" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_item_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_item_id" ON "public"."return_item" USING "btree" ("item_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_item_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_reason_id" ON "public"."return_item" USING "btree" ("reason_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_item_return_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_item_return_id" ON "public"."return_item" USING "btree" ("return_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_order_id" ON "public"."return" USING "btree" ("order_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_reason_parent_return_reason_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_reason_parent_return_reason_id" ON "public"."return_reason" USING "btree" ("parent_return_reason_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_return_reason_value; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_return_reason_value" ON "public"."return_reason" USING "btree" ("value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_sales_channel_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_deleted_at" ON "public"."sales_channel" USING "btree" ("deleted_at");


--
-- Name: IDX_sales_channel_id_-1d67bae40; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_-1d67bae40" ON "public"."publishable_api_key_sales_channel" USING "btree" ("sales_channel_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_sales_channel_id_20b454295; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_20b454295" ON "public"."product_sales_channel" USING "btree" ("sales_channel_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_sales_channel_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_sales_channel_id_26d06f470" ON "public"."sales_channel_stock_location" USING "btree" ("sales_channel_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_deleted_at" ON "public"."search_index" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_search_index_name" ON "public"."search_index" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_sync_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_sync_deleted_at" ON "public"."search_index_sync" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_sync_job_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_sync_job_id" ON "public"."search_index_sync" USING "btree" ("job_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_sync_search_index_version_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_sync_search_index_version_id" ON "public"."search_index_sync" USING "btree" ("search_index_version_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_version_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_version_deleted_at" ON "public"."search_index_version" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_version_search_index_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_search_index_version_search_index_id" ON "public"."search_index_version" USING "btree" ("search_index_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_search_index_version_search_index_id_version; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_search_index_version_search_index_id_version" ON "public"."search_index_version" USING "btree" ("search_index_id", "version") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_service_zone_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_service_zone_deleted_at" ON "public"."service_zone" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_service_zone_fulfillment_set_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_service_zone_fulfillment_set_id" ON "public"."service_zone" USING "btree" ("fulfillment_set_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_service_zone_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_service_zone_name_unique" ON "public"."service_zone" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_method_adjustment_promotion_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_adjustment_promotion_id" ON "public"."cart_shipping_method_adjustment" USING "btree" ("promotion_id") WHERE (("deleted_at" IS NULL) AND ("promotion_id" IS NOT NULL));


--
-- Name: IDX_shipping_method_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_option_id" ON "public"."cart_shipping_method" USING "btree" ("shipping_option_id") WHERE (("deleted_at" IS NULL) AND ("shipping_option_id" IS NOT NULL));


--
-- Name: IDX_shipping_method_tax_line_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_method_tax_line_tax_rate_id" ON "public"."cart_shipping_method_tax_line" USING "btree" ("tax_rate_id") WHERE (("deleted_at" IS NULL) AND ("tax_rate_id" IS NOT NULL));


--
-- Name: IDX_shipping_option_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_deleted_at" ON "public"."shipping_option" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_shipping_option_id_ba32fa9c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_id_ba32fa9c" ON "public"."shipping_option_price_set" USING "btree" ("shipping_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_provider_id" ON "public"."shipping_option" USING "btree" ("provider_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_rule_deleted_at" ON "public"."shipping_option_rule" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_shipping_option_rule_shipping_option_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_rule_shipping_option_id" ON "public"."shipping_option_rule" USING "btree" ("shipping_option_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_service_zone_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_service_zone_id" ON "public"."shipping_option" USING "btree" ("service_zone_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_shipping_option_type_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_shipping_option_type_id" ON "public"."shipping_option" USING "btree" ("shipping_option_type_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_shipping_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_shipping_profile_id" ON "public"."shipping_option" USING "btree" ("shipping_profile_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_option_type_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_option_type_deleted_at" ON "public"."shipping_option_type" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_shipping_profile_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_profile_deleted_at" ON "public"."shipping_profile" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_shipping_profile_id_17a262437; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_shipping_profile_id_17a262437" ON "public"."product_shipping_profile" USING "btree" ("shipping_profile_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_shipping_profile_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_shipping_profile_name_unique" ON "public"."shipping_profile" USING "btree" ("name") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_single_default_region; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_single_default_region" ON "public"."tax_rate" USING "btree" ("tax_region_id") WHERE (("is_default" = true) AND ("deleted_at" IS NULL));


--
-- Name: IDX_stock_location_address_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_address_deleted_at" ON "public"."stock_location_address" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_stock_location_address_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_stock_location_address_id_unique" ON "public"."stock_location" USING "btree" ("address_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_stock_location_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_deleted_at" ON "public"."stock_location" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_stock_location_id_-1e5992737; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_-1e5992737" ON "public"."location_fulfillment_provider" USING "btree" ("stock_location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_stock_location_id_-e88adb96; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_-e88adb96" ON "public"."location_fulfillment_set" USING "btree" ("stock_location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_stock_location_id_26d06f470; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_stock_location_id_26d06f470" ON "public"."sales_channel_stock_location" USING "btree" ("stock_location_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_store_currency_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_currency_deleted_at" ON "public"."store_currency" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_store_currency_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_currency_store_id" ON "public"."store_currency" USING "btree" ("store_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_store_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_deleted_at" ON "public"."store" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_store_locale_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_locale_deleted_at" ON "public"."store_locale" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_store_locale_store_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_store_locale_store_id" ON "public"."store_locale" USING "btree" ("store_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tag_value_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tag_value_unique" ON "public"."product_tag" USING "btree" ("value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_provider_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_provider_deleted_at" ON "public"."tax_provider" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_rate_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_deleted_at" ON "public"."tax_rate" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_deleted_at" ON "public"."tax_rate_rule" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_tax_rate_rule_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_reference_id" ON "public"."tax_rate_rule" USING "btree" ("reference_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_rate_rule_tax_rate_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_rule_tax_rate_id" ON "public"."tax_rate_rule" USING "btree" ("tax_rate_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_rate_rule_unique_rate_reference; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_rate_rule_unique_rate_reference" ON "public"."tax_rate_rule" USING "btree" ("tax_rate_id", "reference_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_rate_tax_region_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_rate_tax_region_id" ON "public"."tax_rate" USING "btree" ("tax_region_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_region_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_deleted_at" ON "public"."tax_region" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_tax_region_parent_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_parent_id" ON "public"."tax_region" USING "btree" ("parent_id");


--
-- Name: IDX_tax_region_provider_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_tax_region_provider_id" ON "public"."tax_region" USING "btree" ("provider_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_tax_region_unique_country_nullable_province; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_nullable_province" ON "public"."tax_region" USING "btree" ("country_code") WHERE (("province_code" IS NULL) AND ("deleted_at" IS NULL));


--
-- Name: IDX_tax_region_unique_country_province; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_tax_region_unique_country_province" ON "public"."tax_region" USING "btree" ("country_code", "province_code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_type_value_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_type_value_unique" ON "public"."product_type" USING "btree" ("value") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_unique_promotion_code; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_unique_promotion_code" ON "public"."promotion" USING "btree" ("code") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_user_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_deleted_at" ON "public"."user" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NOT NULL);


--
-- Name: IDX_user_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_user_email_unique" ON "public"."user" USING "btree" ("email") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_user_id_64ff0c4c; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_id_64ff0c4c" ON "public"."user_rbac_role" USING "btree" ("user_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_user_preference_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_preference_deleted_at" ON "public"."user_preference" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_user_preference_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_user_preference_user_id" ON "public"."user_preference" USING "btree" ("user_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_user_preference_user_id_key_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_user_preference_user_id_key_unique" ON "public"."user_preference" USING "btree" ("user_id", "key") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_variant_id_17b4c4e35; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_variant_id_17b4c4e35" ON "public"."product_variant_inventory_item" USING "btree" ("variant_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_variant_id_52b23597; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_variant_id_52b23597" ON "public"."product_variant_price_set" USING "btree" ("variant_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_view_configuration_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_deleted_at" ON "public"."view_configuration" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_view_configuration_entity_is_system_default; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_entity_is_system_default" ON "public"."view_configuration" USING "btree" ("entity", "is_system_default") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_view_configuration_entity_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_entity_user_id" ON "public"."view_configuration" USING "btree" ("entity", "user_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_view_configuration_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_view_configuration_user_id" ON "public"."view_configuration" USING "btree" ("user_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_deleted_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_deleted_at" ON "public"."workflow_execution" USING "btree" ("deleted_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_id" ON "public"."workflow_execution" USING "btree" ("id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_retention_time_updated_at_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_retention_time_updated_at_state" ON "public"."workflow_execution" USING "btree" ("retention_time", "updated_at", "state") WHERE (("deleted_at" IS NULL) AND ("retention_time" IS NOT NULL));


--
-- Name: IDX_workflow_execution_run_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_run_id" ON "public"."workflow_execution" USING "btree" ("run_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_state" ON "public"."workflow_execution" USING "btree" ("state") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_state_updated_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_state_updated_at" ON "public"."workflow_execution" USING "btree" ("state", "updated_at") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_transaction_id" ON "public"."workflow_execution" USING "btree" ("transaction_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_updated_at_retention_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_updated_at_retention_time" ON "public"."workflow_execution" USING "btree" ("updated_at", "retention_time") WHERE (("deleted_at" IS NULL) AND ("retention_time" IS NOT NULL) AND (("state")::"text" = ANY ((ARRAY['done'::character varying, 'failed'::character varying, 'reverted'::character varying])::"text"[])));


--
-- Name: IDX_workflow_execution_workflow_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_workflow_id" ON "public"."workflow_execution" USING "btree" ("workflow_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IDX_workflow_execution_workflow_id_transaction_id" ON "public"."workflow_execution" USING "btree" ("workflow_id", "transaction_id") WHERE ("deleted_at" IS NULL);


--
-- Name: IDX_workflow_execution_workflow_id_transaction_id_run_id_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IDX_workflow_execution_workflow_id_transaction_id_run_id_unique" ON "public"."workflow_execution" USING "btree" ("workflow_id", "transaction_id", "run_id") WHERE ("deleted_at" IS NULL);


--
-- Name: idx_script_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idx_script_name_unique" ON "public"."script_migrations" USING "btree" ("script_name");


--
-- Name: tax_rate_rule FK_tax_rate_rule_tax_rate_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_rate_rule"
    ADD CONSTRAINT "FK_tax_rate_rule_tax_rate_id" FOREIGN KEY ("tax_rate_id") REFERENCES "public"."tax_rate"("id") ON DELETE CASCADE;


--
-- Name: tax_rate FK_tax_rate_tax_region_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_rate"
    ADD CONSTRAINT "FK_tax_rate_tax_region_id" FOREIGN KEY ("tax_region_id") REFERENCES "public"."tax_region"("id") ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_parent_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_region"
    ADD CONSTRAINT "FK_tax_region_parent_id" FOREIGN KEY ("parent_id") REFERENCES "public"."tax_region"("id") ON DELETE CASCADE;


--
-- Name: tax_region FK_tax_region_provider_id; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tax_region"
    ADD CONSTRAINT "FK_tax_region_provider_id" FOREIGN KEY ("provider_id") REFERENCES "public"."tax_provider"("id") ON DELETE SET NULL;


--
-- Name: application_method_buy_rules application_method_buy_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_buy_rules"
    ADD CONSTRAINT "application_method_buy_rules_application_method_id_foreign" FOREIGN KEY ("application_method_id") REFERENCES "public"."promotion_application_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_buy_rules application_method_buy_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_buy_rules"
    ADD CONSTRAINT "application_method_buy_rules_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "public"."promotion_rule"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_application_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_target_rules"
    ADD CONSTRAINT "application_method_target_rules_application_method_id_foreign" FOREIGN KEY ("application_method_id") REFERENCES "public"."promotion_application_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_method_target_rules application_method_target_rules_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_method_target_rules"
    ADD CONSTRAINT "application_method_target_rules_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "public"."promotion_rule"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_factor auth_mfa_factor_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_mfa_factor"
    ADD CONSTRAINT "auth_mfa_factor_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_mfa_recovery_code auth_mfa_recovery_code_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_mfa_recovery_code"
    ADD CONSTRAINT "auth_mfa_recovery_code_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_password_reset_token"
    ADD CONSTRAINT "auth_password_reset_token_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_password_reset_token auth_password_reset_token_provider_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_password_reset_token"
    ADD CONSTRAINT "auth_password_reset_token_provider_identity_id_foreign" FOREIGN KEY ("provider_identity_id") REFERENCES "public"."provider_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: auth_verification auth_verification_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."auth_verification"
    ADD CONSTRAINT "auth_verification_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: capture capture_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."capture"
    ADD CONSTRAINT "capture_payment_id_foreign" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart"
    ADD CONSTRAINT "cart_billing_address_id_foreign" FOREIGN KEY ("billing_address_id") REFERENCES "public"."cart_address"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_line_item_adjustment cart_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item_adjustment"
    ADD CONSTRAINT "cart_line_item_adjustment_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "public"."cart_line_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item cart_line_item_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item"
    ADD CONSTRAINT "cart_line_item_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_line_item_tax_line cart_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_line_item_tax_line"
    ADD CONSTRAINT "cart_line_item_tax_line_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "public"."cart_line_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart cart_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart"
    ADD CONSTRAINT "cart_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."cart_address"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: cart_shipping_method_adjustment cart_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method_adjustment"
    ADD CONSTRAINT "cart_shipping_method_adjustment_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."cart_shipping_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method cart_shipping_method_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method"
    ADD CONSTRAINT "cart_shipping_method_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: cart_shipping_method_tax_line cart_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."cart_shipping_method_tax_line"
    ADD CONSTRAINT "cart_shipping_method_tax_line_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."cart_shipping_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: credit_line credit_line_cart_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."credit_line"
    ADD CONSTRAINT "credit_line_cart_id_foreign" FOREIGN KEY ("cart_id") REFERENCES "public"."cart"("id") ON UPDATE CASCADE;


--
-- Name: customer_address customer_address_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_address"
    ADD CONSTRAINT "customer_address_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_group_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_group_customer"
    ADD CONSTRAINT "customer_group_customer_customer_group_id_foreign" FOREIGN KEY ("customer_group_id") REFERENCES "public"."customer_group"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: customer_group_customer customer_group_customer_customer_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customer_group_customer"
    ADD CONSTRAINT "customer_group_customer_customer_id_foreign" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment fulfillment_delivery_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment"
    ADD CONSTRAINT "fulfillment_delivery_address_id_foreign" FOREIGN KEY ("delivery_address_id") REFERENCES "public"."fulfillment_address"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment_item fulfillment_item_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_item"
    ADD CONSTRAINT "fulfillment_item_fulfillment_id_foreign" FOREIGN KEY ("fulfillment_id") REFERENCES "public"."fulfillment"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment_label fulfillment_label_fulfillment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment_label"
    ADD CONSTRAINT "fulfillment_label_fulfillment_id_foreign" FOREIGN KEY ("fulfillment_id") REFERENCES "public"."fulfillment"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: fulfillment fulfillment_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment"
    ADD CONSTRAINT "fulfillment_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."fulfillment_provider"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: fulfillment fulfillment_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fulfillment"
    ADD CONSTRAINT "fulfillment_shipping_option_id_foreign" FOREIGN KEY ("shipping_option_id") REFERENCES "public"."shipping_option"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: geo_zone geo_zone_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."geo_zone"
    ADD CONSTRAINT "geo_zone_service_zone_id_foreign" FOREIGN KEY ("service_zone_id") REFERENCES "public"."service_zone"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: image image_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."image"
    ADD CONSTRAINT "image_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: inventory_level inventory_level_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_level"
    ADD CONSTRAINT "inventory_level_inventory_item_id_foreign" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: notification notification_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."notification_provider"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order order_billing_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_billing_address_id_foreign" FOREIGN KEY ("billing_address_id") REFERENCES "public"."order_address"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_change_action order_change_action_order_change_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_change_action"
    ADD CONSTRAINT "order_change_action_order_change_id_foreign" FOREIGN KEY ("order_change_id") REFERENCES "public"."order_change"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_change order_change_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_change"
    ADD CONSTRAINT "order_change_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_credit_line order_credit_line_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_credit_line"
    ADD CONSTRAINT "order_credit_line_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_item"
    ADD CONSTRAINT "order_item_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "public"."order_line_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_item order_item_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_item"
    ADD CONSTRAINT "order_item_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_adjustment order_line_item_adjustment_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item_adjustment"
    ADD CONSTRAINT "order_line_item_adjustment_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "public"."order_line_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item_tax_line order_line_item_tax_line_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item_tax_line"
    ADD CONSTRAINT "order_line_item_tax_line_item_id_foreign" FOREIGN KEY ("item_id") REFERENCES "public"."order_line_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_line_item order_line_item_totals_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_line_item"
    ADD CONSTRAINT "order_line_item_totals_id_foreign" FOREIGN KEY ("totals_id") REFERENCES "public"."order_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order order_shipping_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order"
    ADD CONSTRAINT "order_shipping_address_id_foreign" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."order_address"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: order_shipping_method_adjustment order_shipping_method_adjustment_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping_method_adjustment"
    ADD CONSTRAINT "order_shipping_method_adjustment_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."order_shipping_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping_method_tax_line order_shipping_method_tax_line_shipping_method_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping_method_tax_line"
    ADD CONSTRAINT "order_shipping_method_tax_line_shipping_method_id_foreign" FOREIGN KEY ("shipping_method_id") REFERENCES "public"."order_shipping_method"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_shipping order_shipping_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_shipping"
    ADD CONSTRAINT "order_shipping_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_summary order_summary_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_summary"
    ADD CONSTRAINT "order_summary_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: order_transaction order_transaction_order_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."order_transaction"
    ADD CONSTRAINT "order_transaction_order_id_foreign" FOREIGN KEY ("order_id") REFERENCES "public"."order"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_col_aa276_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_collection_payment_providers"
    ADD CONSTRAINT "payment_collection_payment_providers_payment_col_aa276_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "public"."payment_collection"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_collection_payment_providers payment_collection_payment_providers_payment_pro_2d555_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_collection_payment_providers"
    ADD CONSTRAINT "payment_collection_payment_providers_payment_pro_2d555_foreign" FOREIGN KEY ("payment_provider_id") REFERENCES "public"."payment_provider"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment payment_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment"
    ADD CONSTRAINT "payment_payment_collection_id_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "public"."payment_collection"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payment_session payment_session_payment_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."payment_session"
    ADD CONSTRAINT "payment_session_payment_collection_id_foreign" FOREIGN KEY ("payment_collection_id") REFERENCES "public"."payment_collection"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_list_rule price_list_rule_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_list_rule"
    ADD CONSTRAINT "price_list_rule_price_list_id_foreign" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_list"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_list_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price"
    ADD CONSTRAINT "price_price_list_id_foreign" FOREIGN KEY ("price_list_id") REFERENCES "public"."price_list"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price price_price_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price"
    ADD CONSTRAINT "price_price_set_id_foreign" FOREIGN KEY ("price_set_id") REFERENCES "public"."price_set"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: price_rule price_rule_price_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."price_rule"
    ADD CONSTRAINT "price_rule_price_id_foreign" FOREIGN KEY ("price_id") REFERENCES "public"."price"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category product_category_parent_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_category"
    ADD CONSTRAINT "product_category_parent_category_id_foreign" FOREIGN KEY ("parent_category_id") REFERENCES "public"."product_category"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_category_product"
    ADD CONSTRAINT "product_category_product_product_category_id_foreign" FOREIGN KEY ("product_category_id") REFERENCES "public"."product_category"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_category_product product_category_product_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_category_product"
    ADD CONSTRAINT "product_category_product_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_collection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_collection_id_foreign" FOREIGN KEY ("collection_id") REFERENCES "public"."product_collection"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_option_value product_option_value_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_option_value"
    ADD CONSTRAINT "product_option_value_option_id_foreign" FOREIGN KEY ("option_id") REFERENCES "public"."product_option"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option"
    ADD CONSTRAINT "product_product_option_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option product_product_option_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option"
    ADD CONSTRAINT "product_product_option_product_option_id_foreign" FOREIGN KEY ("product_option_id") REFERENCES "public"."product_option"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option_value"
    ADD CONSTRAINT "product_product_option_value_product_option_value_id_foreign" FOREIGN KEY ("product_option_value_id") REFERENCES "public"."product_option_value"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_product_option_value product_product_option_value_product_product_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_product_option_value"
    ADD CONSTRAINT "product_product_option_value_product_product_option_id_foreign" FOREIGN KEY ("product_product_option_id") REFERENCES "public"."product_product_option"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_tags product_tags_product_tag_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_product_tag_id_foreign" FOREIGN KEY ("product_tag_id") REFERENCES "public"."product_tag"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product product_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product"
    ADD CONSTRAINT "product_type_id_foreign" FOREIGN KEY ("type_id") REFERENCES "public"."product_type"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: product_variant_option product_variant_option_option_value_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_option"
    ADD CONSTRAINT "product_variant_option_option_value_id_foreign" FOREIGN KEY ("option_value_id") REFERENCES "public"."product_option_value"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_option product_variant_option_variant_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_option"
    ADD CONSTRAINT "product_variant_option_variant_id_foreign" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variant"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant product_variant_product_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant"
    ADD CONSTRAINT "product_variant_product_id_foreign" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: product_variant_product_image product_variant_product_image_image_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_variant_product_image"
    ADD CONSTRAINT "product_variant_product_image_image_id_foreign" FOREIGN KEY ("image_id") REFERENCES "public"."image"("id") ON DELETE CASCADE;


--
-- Name: promotion_application_method promotion_application_method_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_application_method"
    ADD CONSTRAINT "promotion_application_method_promotion_id_foreign" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget promotion_campaign_budget_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_campaign_budget"
    ADD CONSTRAINT "promotion_campaign_budget_campaign_id_foreign" FOREIGN KEY ("campaign_id") REFERENCES "public"."promotion_campaign"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_campaign_budget_usage promotion_campaign_budget_usage_budget_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_campaign_budget_usage"
    ADD CONSTRAINT "promotion_campaign_budget_usage_budget_id_foreign" FOREIGN KEY ("budget_id") REFERENCES "public"."promotion_campaign_budget"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion promotion_campaign_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion"
    ADD CONSTRAINT "promotion_campaign_id_foreign" FOREIGN KEY ("campaign_id") REFERENCES "public"."promotion_campaign"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_promotion_rule"
    ADD CONSTRAINT "promotion_promotion_rule_promotion_id_foreign" FOREIGN KEY ("promotion_id") REFERENCES "public"."promotion"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_promotion_rule promotion_promotion_rule_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_promotion_rule"
    ADD CONSTRAINT "promotion_promotion_rule_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "public"."promotion_rule"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: promotion_rule_value promotion_rule_value_promotion_rule_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."promotion_rule_value"
    ADD CONSTRAINT "promotion_rule_value_promotion_rule_id_foreign" FOREIGN KEY ("promotion_rule_id") REFERENCES "public"."promotion_rule"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: provider_identity provider_identity_auth_identity_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."provider_identity"
    ADD CONSTRAINT "provider_identity_auth_identity_id_foreign" FOREIGN KEY ("auth_identity_id") REFERENCES "public"."auth_identity"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: refund refund_payment_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."refund"
    ADD CONSTRAINT "refund_payment_id_foreign" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: region_country region_country_region_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."region_country"
    ADD CONSTRAINT "region_country_region_id_foreign" FOREIGN KEY ("region_id") REFERENCES "public"."region"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: reservation_item reservation_item_inventory_item_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."reservation_item"
    ADD CONSTRAINT "reservation_item_inventory_item_id_foreign" FOREIGN KEY ("inventory_item_id") REFERENCES "public"."inventory_item"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: return_reason return_reason_parent_return_reason_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."return_reason"
    ADD CONSTRAINT "return_reason_parent_return_reason_id_foreign" FOREIGN KEY ("parent_return_reason_id") REFERENCES "public"."return_reason"("id");


--
-- Name: search_index_sync search_index_sync_search_index_version_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_index_sync"
    ADD CONSTRAINT "search_index_sync_search_index_version_id_foreign" FOREIGN KEY ("search_index_version_id") REFERENCES "public"."search_index_version"("id") ON UPDATE CASCADE;


--
-- Name: search_index_version search_index_version_search_index_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."search_index_version"
    ADD CONSTRAINT "search_index_version_search_index_id_foreign" FOREIGN KEY ("search_index_id") REFERENCES "public"."search_index"("id") ON UPDATE CASCADE;


--
-- Name: service_zone service_zone_fulfillment_set_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."service_zone"
    ADD CONSTRAINT "service_zone_fulfillment_set_id_foreign" FOREIGN KEY ("fulfillment_set_id") REFERENCES "public"."fulfillment_set"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_provider_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option"
    ADD CONSTRAINT "shipping_option_provider_id_foreign" FOREIGN KEY ("provider_id") REFERENCES "public"."fulfillment_provider"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: shipping_option_rule shipping_option_rule_shipping_option_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option_rule"
    ADD CONSTRAINT "shipping_option_rule_shipping_option_id_foreign" FOREIGN KEY ("shipping_option_id") REFERENCES "public"."shipping_option"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_service_zone_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option"
    ADD CONSTRAINT "shipping_option_service_zone_id_foreign" FOREIGN KEY ("service_zone_id") REFERENCES "public"."service_zone"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_option_type_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option"
    ADD CONSTRAINT "shipping_option_shipping_option_type_id_foreign" FOREIGN KEY ("shipping_option_type_id") REFERENCES "public"."shipping_option_type"("id") ON UPDATE CASCADE;


--
-- Name: shipping_option shipping_option_shipping_profile_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."shipping_option"
    ADD CONSTRAINT "shipping_option_shipping_profile_id_foreign" FOREIGN KEY ("shipping_profile_id") REFERENCES "public"."shipping_profile"("id") ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: stock_location stock_location_address_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."stock_location"
    ADD CONSTRAINT "stock_location_address_id_foreign" FOREIGN KEY ("address_id") REFERENCES "public"."stock_location_address"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_currency store_currency_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."store_currency"
    ADD CONSTRAINT "store_currency_store_id_foreign" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: store_locale store_locale_store_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."store_locale"
    ADD CONSTRAINT "store_locale_store_id_foreign" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


