import {
  transformNullableFormData,
  transformNullableFormNumber
} from "./chunk-3ISBJK7K.mjs";
import "./chunk-WMOGMKQN.mjs";
import {
  CountrySelect
} from "./chunk-QPOHS2VE.mjs";
import "./chunk-DG7J63J2.mjs";
import {
  Combobox
} from "./chunk-53MXUSIR.mjs";
import "./chunk-IUCDCPJU.mjs";
import {
  KeyboundForm
} from "./chunk-6HTZNHPT.mjs";
import {
  optionalFloat
} from "./chunk-I4R6NKVR.mjs";
import "./chunk-6GU6IDUA.mjs";
import {
  RouteDrawer
} from "./chunk-M6QL27ZL.mjs";
import {
  useRouteModal
} from "./chunk-GXJ5J364.mjs";
import {
  Form
} from "./chunk-OBQI23QM.mjs";
import "./chunk-WWCRED3P.mjs";
import "./chunk-CXRGHH7Y.mjs";
import "./chunk-HIX2NSSN.mjs";
import "./chunk-2LVQXUFY.mjs";
import "./chunk-EYDZJ522.mjs";
import "./chunk-A4EQBFAR.mjs";
import "./chunk-QG545K2O.mjs";
import "./chunk-RW5LLFK2.mjs";
import "./chunk-ISGDOD5J.mjs";
import "./chunk-QIUJGXDT.mjs";
import "./chunk-ZB3WPQQA.mjs";
import "./chunk-DEOCXBV2.mjs";
import "./chunk-2V5DOTI3.mjs";
import "./chunk-PTP3K7TB.mjs";
import "./chunk-22ELTIVU.mjs";
import "./chunk-Y2BEKAYF.mjs";
import "./chunk-2VYWSRWQ.mjs";
import "./chunk-D3TDNKSZ.mjs";
import "./chunk-ACQJSQ5A.mjs";
import {
  productVariantQueryKeys
} from "./chunk-SH6DEX5S.mjs";
import "./chunk-DSBMVN2K.mjs";
import "./chunk-RIAKFHWQ.mjs";
import "./chunk-3C2RPYDJ.mjs";
import "./chunk-4SIZ37QP.mjs";
import "./chunk-CHQR6GOM.mjs";
import "./chunk-HWLVYKUO.mjs";
import "./chunk-BGQF2VTH.mjs";
import "./chunk-EMDIIWVL.mjs";
import "./chunk-YDJ774GR.mjs";
import "./chunk-SKQPG6BC.mjs";
import "./chunk-5N2B66CN.mjs";
import {
  useProduct,
  useProductVariant,
  useUpdateProductVariant
} from "./chunk-2G6AYJ2P.mjs";
import "./chunk-HGRIOEAR.mjs";
import {
  queryClient
} from "./chunk-SEMVMECK.mjs";
import {
  sdk
} from "./chunk-NFEK63OE.mjs";
import "./chunk-QZ7TP4HQ.mjs";

// src/routes/product-variants/product-variant-edit/product-variant-edit.tsx
import { Heading as Heading2 } from "@medusajs/ui";
import { useTranslation as useTranslation2 } from "react-i18next";
import { useLoaderData, useParams, useSearchParams } from "react-router-dom";

// src/routes/product-variants/product-variant-edit/components/product-edit-variant-form/product-edit-variant-form.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Divider, Heading, Input, Switch, toast } from "@medusajs/ui";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { jsx, jsxs } from "react/jsx-runtime";

var ProductEditVariantSchema = z.object({
  title: z.string().min(1),
  material: z.string().optional(),
  priority: z.union([z.string(), z.number()]).optional(),
  sku: z.string().optional(),
  ean: z.string().optional(),
  upc: z.string().optional(),
  barcode: z.string().optional(),
  manage_inventory: z.boolean(),
  allow_backorder: z.boolean(),
  weight: optionalFloat,
  height: optionalFloat,
  width: optionalFloat,
  length: optionalFloat,
  mid_code: z.string().optional(),
  hs_code: z.string().optional(),
  origin_country: z.string().optional(),
  options: z.record(z.string(), z.string())
});

var ProductEditVariantForm = ({
  variant,
  product
}) => {
  const { t } = useTranslation();
  const { handleSuccess } = useRouteModal();
  const defaultOptions = product.options?.reduce((acc, option) => {
    const varOpt = variant.options?.find((o) => o.option_id === option.id);
    acc[option.title] = varOpt?.value;
    return acc;
  }, {});

  const form = useForm({
    defaultValues: {
      title: variant.title || "",
      material: variant.material || "",
      priority: variant.metadata?.priority ?? product?.metadata?.priority ?? "",
      sku: variant.sku || "",
      ean: variant.ean || "",
      upc: variant.upc || "",
      barcode: variant.barcode || "",
      manage_inventory: variant.manage_inventory || false,
      allow_backorder: variant.allow_backorder || false,
      weight: variant.weight || "",
      height: variant.height || "",
      width: variant.width || "",
      length: variant.length || "",
      mid_code: variant.mid_code || "",
      hs_code: variant.hs_code || "",
      origin_country: variant.origin_country || "",
      options: defaultOptions
    },
    resolver: zodResolver(ProductEditVariantSchema)
  });

  const { mutateAsync, isPending } = useUpdateProductVariant(
    variant.product_id,
    variant.id
  );

  const handleSubmit = form.handleSubmit(async (data) => {
    const {
      title,
      weight,
      height,
      width,
      length,
      allow_backorder,
      manage_inventory,
      options,
      priority,
      ...optional
    } = data;

    const rawPriority = priority !== undefined && priority !== "" ? parseInt(String(priority).trim(), 10) : null;
    const priorityNum = rawPriority && !isNaN(rawPriority) && rawPriority > 0 ? rawPriority : null;

    // Collision check if priority is provided
    if (priorityNum !== null) {
      try {
        const categoryIds = (product.categories || []).map((c) => c.id).filter(Boolean);
        if (categoryIds.length > 0) {
          const listRes = await sdk.admin.product.list({
            category_id: categoryIds,
            fields: "+metadata,title,id",
            limit: 100,
          });
          const existing = (listRes.products || []).find((p) => {
            if (p.id === product.id) return false;
            const pPri = p.metadata?.priority;
            return pPri && parseInt(String(pPri), 10) === priorityNum;
          });
          if (existing) {
            form.setError("priority", {
              type: "manual",
              message: `Priority ${priorityNum} is already assigned to "${existing.title}".`,
            });
            toast.error(`Priority ${priorityNum} is already assigned to "${existing.title}".`);
            return;
          }
        }
      } catch (err) {
        console.warn("Priority collision check skipped:", err);
      }
    }

    const nullableData = transformNullableFormData(optional);
    const updatedMetadata = {
      ...(variant.metadata || {}),
      priority: priorityNum,
    };

    await mutateAsync(
      {
        id: variant.id,
        weight: transformNullableFormNumber(weight),
        height: transformNullableFormNumber(height),
        width: transformNullableFormNumber(width),
        length: transformNullableFormNumber(length),
        title,
        allow_backorder,
        manage_inventory,
        options,
        metadata: updatedMetadata,
        ...nullableData
      },
      {
        onSuccess: async () => {
          // Mirror metadata.priority to the parent product as well
          try {
            await sdk.admin.product.update(variant.product_id, {
              metadata: {
                ...(product.metadata || {}),
                priority: priorityNum,
              },
            });
          } catch (e) {
            console.warn("Could not mirror priority to product:", e);
          }
          handleSuccess("../");
          toast.success(t("products.variant.edit.success"));
        },
        onError: (error) => {
          toast.error(error.message);
        }
      }
    );
  });

  return jsx(RouteDrawer.Form, { form, children: jsxs(
    KeyboundForm,
    {
      onSubmit: handleSubmit,
      className: "flex size-full flex-col overflow-hidden",
      children: [
        jsxs(RouteDrawer.Body, { className: "flex size-full flex-col gap-y-8 overflow-auto", children: [
          jsxs("div", { className: "flex flex-col gap-y-4", children: [
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "title",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { children: t("fields.title") }),
                    jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "material",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.material") }),
                    jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            product.options?.map((option) => {
              return jsx(
                Form.Field,
                {
                  control: form.control,
                  name: `options.${option.title}`,
                  render: ({ field: { value, onChange, ...field } }) => {
                    return jsxs(Form.Item, { children: [
                      jsx(Form.Label, { children: option.title }),
                      jsx(Form.Control, { children: jsx(
                        Combobox,
                        {
                          value,
                          onChange: (v) => {
                            onChange(v);
                          },
                          ...field,
                          options: option.values.map((v) => ({
                            label: v.value,
                            value: v.value
                          }))
                        }
                      ) })
                    ] });
                  }
                },
                option.id
              );
            }),
            /* Priority Field - Native Medusa UI */
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "priority",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: "Priority" }),
                    jsx(Form.Control, { children: jsx(Input, {
                      type: "number",
                      min: 1,
                      placeholder: "e.g. 1",
                      ...field
                    }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            )
          ] }),
          jsx(Divider, {}),
          jsxs("div", { className: "flex flex-col gap-y-8", children: [
            jsxs("div", { className: "flex flex-col gap-y-4", children: [
              jsx(Heading, { level: "h2", children: t("products.variant.inventory.header") }),
              jsx(
                Form.Field,
                {
                  control: form.control,
                  name: "sku",
                  render: ({ field }) => {
                    return jsxs(Form.Item, { children: [
                      jsx(Form.Label, { optional: true, children: t("fields.sku") }),
                      jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                      jsx(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              jsx(
                Form.Field,
                {
                  control: form.control,
                  name: "ean",
                  render: ({ field }) => {
                    return jsxs(Form.Item, { children: [
                      jsx(Form.Label, { optional: true, children: t("fields.ean") }),
                      jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                      jsx(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              jsx(
                Form.Field,
                {
                  control: form.control,
                  name: "upc",
                  render: ({ field }) => {
                    return jsxs(Form.Item, { children: [
                      jsx(Form.Label, { optional: true, children: t("fields.upc") }),
                      jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                      jsx(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              jsx(
                Form.Field,
                {
                  control: form.control,
                  name: "barcode",
                  render: ({ field }) => {
                    return jsxs(Form.Item, { children: [
                      jsx(Form.Label, { optional: true, children: t("fields.barcode") }),
                      jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                      jsx(Form.ErrorMessage, {})
                    ] });
                  }
                }
              ),
              jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
                jsx(
                  Form.Field,
                  {
                    control: form.control,
                    name: "manage_inventory",
                    render: ({ field: { value, onChange, ...field } }) => {
                      return jsxs(Form.Item, { children: [
                        jsxs("div", { className: "flex items-center justify-between", children: [
                          jsx(Form.Label, { children: t("products.variant.inventory.manageInventory") }),
                          jsx(Form.Control, { children: jsx(
                            Switch,
                            {
                              checked: value,
                              onCheckedChange: (checked) => onChange(!!checked),
                              ...field
                            }
                          ) })
                        ] }),
                        jsx(Form.Hint, { children: t("products.variant.inventory.manageInventoryHint") })
                      ] });
                    }
                  }
                ),
                jsx(
                  Form.Field,
                  {
                    control: form.control,
                    name: "allow_backorder",
                    render: ({ field: { value, onChange, ...field } }) => {
                      return jsxs(Form.Item, { children: [
                        jsxs("div", { className: "flex items-center justify-between", children: [
                          jsx(Form.Label, { children: t("products.variant.inventory.allowBackorders") }),
                          jsx(Form.Control, { children: jsx(
                            Switch,
                            {
                              checked: value,
                              onCheckedChange: (checked) => onChange(!!checked),
                              ...field
                            }
                          ) })
                        ] }),
                        jsx(Form.Hint, { children: t("products.variant.inventory.allowBackordersHint") })
                      ] });
                    }
                  }
                )
              ] })
            ] })
          ] }),
          jsx(Divider, {}),
          jsxs("div", { className: "flex flex-col gap-y-4", children: [
            jsx(Heading, { level: "h2", children: t("products.attributes") }),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "weight",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.weight") }),
                    jsx(Form.Control, { children: jsx(Input, { type: "number", ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "width",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.width") }),
                    jsx(Form.Control, { children: jsx(Input, { type: "number", ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "length",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.length") }),
                    jsx(Form.Control, { children: jsx(Input, { type: "number", ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "height",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.height") }),
                    jsx(Form.Control, { children: jsx(Input, { type: "number", ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "mid_code",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.midCode") }),
                    jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "hs_code",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.hsCode") }),
                    jsx(Form.Control, { children: jsx(Input, { ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            ),
            jsx(
              Form.Field,
              {
                control: form.control,
                name: "origin_country",
                render: ({ field }) => {
                  return jsxs(Form.Item, { children: [
                    jsx(Form.Label, { optional: true, children: t("fields.countryOfOrigin") }),
                    jsx(Form.Control, { children: jsx(CountrySelect, { ...field }) }),
                    jsx(Form.ErrorMessage, {})
                  ] });
                }
              }
            )
          ] })
        ] }),
        jsx(RouteDrawer.Footer, { children: jsxs("div", { className: "flex items-center justify-end gap-x-2", children: [
          jsx(RouteDrawer.Close, { asChild: true, children: jsx(Button, { size: "small", variant: "secondary", children: t("actions.cancel") }) }),
          jsx(Button, { size: "small", type: "submit", isLoading: isPending, children: t("actions.save") })
        ] }) })
      ]
    }
  ) });
};

// src/routes/product-variants/product-variant-edit/product-variant-edit.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
var ProductVariantEdit = () => {
  const initialData = useLoaderData();
  const { t } = useTranslation2();
  const { id, variant_id } = useParams();
  const [URLSearchParms] = useSearchParams();
  const searchVariantId = URLSearchParms.get("variant_id");
  const { variant, isPending, isError, error } = useProductVariant(
    id,
    variant_id || searchVariantId,
    void 0,
    {
      initialData
    }
  );
  const {
    product,
    isPending: isProductPending,
    isError: isProductError,
    error: productError
  } = useProduct(
    variant?.product_id,
    {
      fields: "-type,-collection,-tags,-images,-variants,-sales_channels,+categories,+metadata"
    },
    {
      enabled: !!variant?.product_id
    }
  );
  const ready = !isPending && !!variant && !isProductPending && !!product;
  if (isError) {
    throw error;
  }
  if (isProductError) {
    throw productError;
  }
  return jsxs2(RouteDrawer, { children: [
    jsx2(RouteDrawer.Header, { children: jsx2(Heading2, { children: t("products.variant.edit.header") }) }),
    ready && jsx2(ProductEditVariantForm, { variant, product })
  ] });
};

// src/routes/product-variants/product-variant-edit/loader.ts
var queryFn = async (id, variantId) => {
  return await sdk.admin.product.retrieveVariant(id, variantId);
};
var editProductVariantQuery = (id, variantId) => ({
  queryKey: productVariantQueryKeys.detail(variantId),
  queryFn: async () => queryFn(id, variantId)
});
var editProductVariantLoader = async ({
  params,
  request
}) => {
  const id = params.id;
  const searchParams = new URL(request.url).searchParams;
  const searchVariantId = searchParams.get("variant_id");
  const variantId = params.variant_id || searchVariantId;
  const query = editProductVariantQuery(id, variantId || searchVariantId);
  return queryClient.getQueryData(query.queryKey) ?? await queryClient.fetchQuery(query);
};

export {
  ProductVariantEdit as Component,
  editProductVariantLoader as loader
};
