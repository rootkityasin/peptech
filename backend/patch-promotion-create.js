const fs = require('fs');
const path = require('path');

const targetFile = path.resolve('node_modules/@medusajs/dashboard/dist/promotion-create-YIJ6WBRD.mjs');
const backupFile = path.resolve('node_modules/@medusajs/dashboard/dist/promotion-create-YIJ6WBRD.mjs.bak');

let content = fs.readFileSync(backupFile, 'utf8');

// 0. Import Select from @medusajs/ui
const importTarget = '  RadioGroup,\n  Switch,';
const importReplacement = '  RadioGroup,\n  Select,\n  Switch,';
if (content.includes(importTarget)) {
  content = content.replace(importTarget, importReplacement);
  console.log('0. Imported Select from @medusajs/ui');
} else {
  console.error('ERROR: importTarget not found');
}

// 1. Add fields to CreatePromotionSchema
const schemaTarget = 'CreatePromotionSchema = z.object({';
content = content.replace(
  schemaTarget,
  schemaTarget + '\n  spend_threshold: z.union([z.number(), z.string()]).optional().nullable(),\n  rule_operator: z.string().optional().nullable(),\n  storefront_message: z.string().optional().nullable(),'
);
console.log('1. Added spend_threshold, rule_operator, storefront_message to CreatePromotionSchema');

// 2. Add defaults to defaultValues
const defaultValuesTarget = 'defaultValues = {';
content = content.replace(
  defaultValuesTarget,
  defaultValuesTarget + '\n  spend_threshold: "150",\n  rule_operator: "gte",\n  storefront_message: "Add {remaining} more for Free Tracked 24 Shipping",'
);
console.log('2. Added spend_threshold, rule_operator, storefront_message to defaultValues');

// 3. Add fields to handleSubmit
const handleSubmitExtractTarget = 'rules,\n        ...promotionData\n      } = data;';
const handleSubmitExtractReplacement = `rules,
        spend_threshold,
        rule_operator,
        storefront_message,
        ...promotionData
      } = data;
      const numThreshold = Number(spend_threshold || 150);
      const op = rule_operator || "gte";
      const sMsg = (storefront_message && storefront_message.trim()) || "Add {remaining} more for Free Tracked 24 Shipping";
      if (currentTemplate?.id === "shipping_discount") {
        promotionData.metadata = {
          ...(promotionData.metadata || {}),
          threshold: numThreshold,
          rule_operator: op,
          storefront_message: sMsg,
          delivery_method: "Royal Mail Tracked 24",
          title: "Free Tracked 24 Shipping over £" + numThreshold
        };
        rules.push({
          operator: op,
          attribute: "subtotal",
          values: [String(numThreshold)]
        });
      }`;

content = content.replace(handleSubmitExtractTarget, handleSubmitExtractReplacement);
console.log('3. Enhanced handleSubmit with spend_threshold, rule_operator, storefront_message');

// 4. Add fields to UI in Details tab
const codeFieldTarget = `/* @__PURE__ */ jsx("div", { className: "flex gap-y-4", children: /* @__PURE__ */ jsx(
                    Form.Field,
                    {
                      control: form.control,
                      name: "code",
                      render: ({ field }) => {
                        return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
                          /* @__PURE__ */ jsx(Form.Label, { children: t("promotions.form.code.title") }),
                          /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Input, { ...field, placeholder: "SUMMER15" }) }),
                          /* @__PURE__ */ jsx(
                            Text,
                            {
                              size: "small",
                              leading: "compact",
                              className: "text-ui-fg-subtle",
                              children: /* @__PURE__ */ jsx(
                                Trans,
                                {
                                  t,
                                  i18nKey: "promotions.form.code.description",
                                  components: [/* @__PURE__ */ jsx("br", {}, "break")]
                                }
                              )
                            }
                          )
                        ] });
                      }
                    }
                  ) })`;

const codeFieldReplacement = `/* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
                      /* @__PURE__ */ jsx(
                        Form.Field,
                        {
                          control: form.control,
                          name: "code",
                          render: ({ field }) => {
                            return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
                              /* @__PURE__ */ jsx(Form.Label, { children: t("promotions.form.code.title") }),
                              /* @__PURE__ */ jsx(Form.Control, { children: /* @__PURE__ */ jsx(Input, { ...field, placeholder: "SUMMER15" }) }),
                              /* @__PURE__ */ jsx(
                                Text,
                                {
                                  size: "small",
                                  leading: "compact",
                                  className: "text-ui-fg-subtle",
                                  children: /* @__PURE__ */ jsx(
                                    Trans,
                                    {
                                      t,
                                      i18nKey: "promotions.form.code.description",
                                      components: [/* @__PURE__ */ jsx("br", {}, "break")]
                                    }
                                  )
                                }
                              )
                            ] });
                          }
                        }
                      ),
                      currentTemplate?.id === "shipping_discount" && /* @__PURE__ */ jsx(
                        Form.Field,
                        {
                          control: form.control,
                          name: "spend_threshold",
                          render: ({ field }) => {
                            return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
                              /* @__PURE__ */ jsx(Form.Label, { children: "Minimum Spend Threshold (GBP £)" }),
                              /* @__PURE__ */ jsx(Form.Control, {
                                children: /* @__PURE__ */ jsx(Input, {
                                  type: "number",
                                  step: "1",
                                  min: "0",
                                  ...field,
                                  value: field.value ?? "150",
                                  placeholder: "150"
                                })
                              }),
                              /* @__PURE__ */ jsx(
                                Text,
                                {
                                  size: "small",
                                  leading: "compact",
                                  className: "text-ui-fg-subtle",
                                  children: "Orders meeting or exceeding this subtotal qualify for free delivery."
                                }
                              )
                            ] });
                          }
                        }
                      )
                    ] }),
                    currentTemplate?.id === "shipping_discount" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
                      /* @__PURE__ */ jsx(
                        Form.Field,
                        {
                          control: form.control,
                          name: "rule_operator",
                          render: ({ field }) => {
                            return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
                              /* @__PURE__ */ jsx(Form.Label, { children: "Qualification Rule Condition" }),
                              /* @__PURE__ */ jsx(Form.Control, {
                                children: /* @__PURE__ */ jsxs(Select, {
                                  size: "small",
                                  value: field.value || "gte",
                                  onValueChange: field.onChange,
                                  children: [
                                    /* @__PURE__ */ jsx(Select.Trigger, {
                                      children: /* @__PURE__ */ jsx(Select.Value, { placeholder: "Select operator" })
                                    }),
                                    /* @__PURE__ */ jsxs(Select.Content, {
                                      children: [
                                        /* @__PURE__ */ jsx(Select.Item, {
                                          value: "gte",
                                          children: "Cart Subtotal \u2265 (Greater than or equal to)"
                                        }),
                                        /* @__PURE__ */ jsx(Select.Item, {
                                          value: "gt",
                                          children: "Cart Subtotal > (Strictly greater than)"
                                        })
                                      ]
                                    })
                                  ]
                                })
                              }),
                              /* @__PURE__ */ jsx(
                                Text,
                                {
                                  size: "small",
                                  leading: "compact",
                                  className: "text-ui-fg-subtle",
                                  children: "Operator applied when checking qualifying cart value."
                                }
                              )
                            ] });
                          }
                        }
                      ),
                      /* @__PURE__ */ jsx(
                        Form.Field,
                        {
                          control: form.control,
                          name: "storefront_message",
                          render: ({ field }) => {
                            return /* @__PURE__ */ jsxs(Form.Item, { className: "basis-1/2", children: [
                              /* @__PURE__ */ jsx(Form.Label, { children: "Storefront Cart Drawer Message" }),
                              /* @__PURE__ */ jsx(Form.Control, {
                                children: /* @__PURE__ */ jsx(Input, {
                                  ...field,
                                  value: field.value ?? "Add {remaining} more for Free Tracked 24 Shipping",
                                  placeholder: "Add {remaining} more for Free Tracked 24 Shipping"
                                })
                              }),
                              /* @__PURE__ */ jsx(
                                Text,
                                {
                                  size: "small",
                                  leading: "compact",
                                  className: "text-ui-fg-subtle",
                                  children: "Use {remaining} as the placeholder for the remaining spend amount."
                                }
                              )
                            ] });
                          }
                        }
                      )
                    ] })
                  ] })`;

if (content.includes(codeFieldTarget)) {
  content = content.replace(codeFieldTarget, codeFieldReplacement);
  console.log('4. Added Spend Threshold, Rule Operator, and Storefront Message fields!');
} else {
  console.error('ERROR: codeFieldTarget still did not match');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully written to', targetFile);
