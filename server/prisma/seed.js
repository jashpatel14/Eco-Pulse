/**
 * Voltex Systems - Comprehensive Industry-Standard Seed Script
 * Company: Voltex Systems (Industrial Power Supplies & Control Panels)
 * Location: Pune/Bangalore, India
 */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Voltex Systems industry-standard database seed...');

  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('Voltex@2025', saltRounds);

  await prisma.$transaction(async (tx) => {
    // ─── 1. CLEAR EXISTING DATA ───────────────────────────────────
    console.log('🧹 Clearing old records...');
    await tx.notification.deleteMany({});
    await tx.auditLog.deleteMany({});
    await tx.eCODraftChange.deleteMany({});
    await tx.eCOApprovalRule.deleteMany({});
    await tx.eCO.deleteMany({});
    await tx.eCOStage.deleteMany({});
    await tx.bOMOperation.deleteMany({});
    await tx.bOMComponent.deleteMany({});
    await tx.bOM.deleteMany({});
    await tx.productVersion.deleteMany({});
    await tx.product.deleteMany({});
    await tx.refreshToken.deleteMany({});
    await tx.emailToken.deleteMany({});
    await tx.user.deleteMany({});

    // ─── 2. SEED USERS (8 Users) ──────────────────────────────────
    console.log('👥 Seeding users...');
    const usersData = [
      { loginId: 'arjun.mehta', name: 'Arjun Mehta', email: 'arjun.mehta@voltex.in', role: 'ENGINEERING_USER' },
      { loginId: 'priya.sharma', name: 'Priya Sharma', email: 'priya.sharma@voltex.in', role: 'ENGINEERING_USER' },
      { loginId: 'rahul.nair', name: 'Rahul Nair', email: 'rahul.nair@voltex.in', role: 'APPROVER' },
      { loginId: 'ananya.iyer', name: 'Ananya Iyer', email: 'ananya.iyer@voltex.in', role: 'APPROVER' },
      { loginId: 'amit.verma', name: 'Amit Verma', email: 'amit.verma@voltex.in', role: 'OPERATIONS_USER' },
      { loginId: 'sneha.patel', name: 'Sneha Patel', email: 'sneha.patel@voltex.in', role: 'OPERATIONS_USER' },
      { loginId: 'vikram.singh', name: 'Vikram Singh', email: 'vikram.singh@voltex.in', role: 'ADMIN' },
      { loginId: 'kavita.reddy', name: 'Kavita Reddy', email: 'kavita.reddy@voltex.in', role: 'USER' },
    ];

    const users = {};
    for (const u of usersData) {
      users[u.loginId] = await tx.user.create({
        data: {
          ...u,
          password: defaultPassword,
          is_verified: true,
          provider: 'local'
        }
      });
    }

    // ─── 3. SEED ECO STAGES (5 Stages) ────────────────────────────
    console.log('🏁 Seeding ECO stages...');
    const stagesData = [
      { name: 'Draft', orderIndex: 1, approvalRequired: false },
      { name: 'Engineering Review', orderIndex: 2, approvalRequired: true },
      { name: 'Quality Review', orderIndex: 3, approvalRequired: true },
      { name: 'Management Approval', orderIndex: 4, approvalRequired: true },
      { name: 'Applied', orderIndex: 5, approvalRequired: false },
    ];

    const stages = {};
    for (const s of stagesData) {
      stages[s.name] = await tx.eCOStage.create({ data: s });
    }

    // ─── 4. SEED APPROVAL RULES ───────────────────────────────────
    console.log('⚖️ Seeding approval rules...');
    const approvers = [users['rahul.nair'], users['ananya.iyer']];
    const targetStages = ['Engineering Review', 'Quality Review', 'Management Approval'];

    for (const stageName of targetStages) {
      // Required Approver
      await tx.eCOApprovalRule.create({
        data: {
          stageId: stages[stageName].id,
          userId: approvers[0].id,
          approvalCategory: 'REQUIRED'
        }
      });
      // Optional Approver
      await tx.eCOApprovalRule.create({
        data: {
          stageId: stages[stageName].id,
          userId: approvers[1].id,
          approvalCategory: 'OPTIONAL'
        }
      });
    }

    // ─── 5. SEED PRODUCTS (20 Products) ───────────────────────────
    console.log('📦 Seeding products & historical versions...');
    const productModels = [
      { name: 'VX-500W-SMPS', basePrice: 4500, cost: 2800, versions: 3, status: 'ACTIVE' },
      { name: 'VX-1KW-DRIVE', basePrice: 28000, cost: 18500, versions: 4, status: 'ACTIVE' },
      { name: 'VX-CTRL-LOGIC-LX', basePrice: 12500, cost: 7200, versions: 2, status: 'ACTIVE' },
      { name: 'VX-PWR-DIST-75A', basePrice: 8500, cost: 4200, versions: 1, status: 'ACTIVE' },
      { name: 'VX-UPS-BASIC-150', basePrice: 3200, cost: 1800, versions: 1, status: 'ARCHIVED' },
      { name: 'VX-GATE-DRIVER-H1', basePrice: 1400, cost: 650, versions: 4, status: 'ACTIVE' },
      { name: 'VX-SOFT-START-90', basePrice: 15500, cost: 9800, versions: 2, status: 'ACTIVE' },
      { name: 'VX-ISO-TRANS-2K', basePrice: 7800, cost: 4500, versions: 3, status: 'ACTIVE' },
      { name: 'VX-SENSE-TEMP-04', basePrice: 950, cost: 320, versions: 1, status: 'ACTIVE' },
      { name: 'VX-ENCL-IP65-M', basePrice: 5500, cost: 2100, versions: 2, status: 'ACTIVE' },
      { name: 'VX-DC-CONV-24-12', basePrice: 2400, cost: 1100, versions: 3, status: 'ACTIVE' },
      { name: 'VX-FILTER-EMI-X1', basePrice: 1800, cost: 780, versions: 1, status: 'ACTIVE' },
      { name: 'VX-SSR-SOLID-50A', basePrice: 2100, cost: 950, versions: 2, status: 'ACTIVE' },
      { name: 'VX-PLC-NODE-PRO', basePrice: 34000, cost: 22000, versions: 1, status: 'ACTIVE' },
      { name: 'VX-LCD-DISP-4IN', basePrice: 4200, cost: 2600, versions: 2, status: 'ARCHIVED' },
      { name: 'VX-BUSBAR-CU-400', basePrice: 1200, cost: 800, versions: 1, status: 'ACTIVE' },
      { name: 'VX-CAP-BANK-450V', basePrice: 6500, cost: 4100, versions: 3, status: 'ACTIVE' },
      { name: 'VX-RECT-BRIDGE-20', basePrice: 850, cost: 410, versions: 2, status: 'ACTIVE' },
      { name: 'VX-FUSE-HRC-100A', basePrice: 450, cost: 120, versions: 1, status: 'ACTIVE' },
      { name: 'VX-WIRING-LOOM-LV', basePrice: 5200, cost: 3100, versions: 4, status: 'ACTIVE' },
    ];

    const products = [];
    for (const p of productModels) {
      const createdProduct = await tx.product.create({
        data: {
          name: p.name,
          salePrice: p.basePrice,
          costPrice: p.cost,
          currentVersion: p.versions,
          status: p.status,
          attachments: [`DATASHEET-${p.name}.pdf`]
        }
      });

      // Seed Product Versions
      for (let v = 1; v <= p.versions; v++) {
        await tx.productVersion.create({
          data: {
            productId: createdProduct.id,
            versionNumber: v,
            salePrice: p.basePrice - (p.versions - v) * 200, // Slight price drops for older versions
            costPrice: p.cost - (p.versions - v) * 150,
            status: v === p.versions ? p.status : 'ARCHIVED',
            attachments: [`SPEC-V${v}-${p.name}.pdf`],
            createdById: users['arjun.mehta'].id
          }
        });
      }
      products.push(createdProduct);
    }

    // ─── 6. SEED BOMS (One per active product) ────────────────────
    console.log('🛠️ Seeding BOMs, components, and operations...');
    const activeProducts = products.filter(p => p.status === 'ACTIVE');
    const boms = [];

    const componentsPool = [
      { name: 'IRF3205 MOSFET', supplier: 'Infineon', cost: 45, type: 'BUY' },
      { name: 'LM7805 Voltage Regulator', supplier: 'Texas Instruments', cost: 22, type: 'BUY' },
      { name: '10uF 50V Capacitor', supplier: 'Nichicon', cost: 8, type: 'BUY' },
      { name: '4.7k Ohm Resistor 0.25W', supplier: 'Vishay', cost: 2, type: 'BUY' },
      { name: 'Winding Toroid Core', supplier: 'In-House', cost: 120, type: 'MAKE' },
      { name: 'Aluminium Heat Sink', supplier: 'Voltex Extrusions', cost: 180, type: 'MAKE' },
      { name: 'Fiberglass PCB Base', supplier: 'CircuitFab India', cost: 350, type: 'BUY' },
      { name: 'Copper Foil 35um', supplier: 'IndoCopper', cost: 95, type: 'BUY' },
      { name: 'Custom Plastic Enclosure', supplier: 'Voltex Molding', cost: 450, type: 'MAKE' },
      { name: 'M4 Mounting Screws', supplier: 'Fastener Mart', cost: 5, type: 'BUY' },
      { name: 'TE Connectivity Connector', supplier: 'TE Connectivity', cost: 85, type: 'BUY' },
      { name: 'Nichrome Heating Element', supplier: 'Ohmite', cost: 620, type: 'BUY' },
    ];

    const operationsPool = [
      { name: 'SMT Pick and Place', center: 'Line A', duration: 120 },
      { name: 'Reflow Soldering', center: 'Oven X5', duration: 45 },
      { name: 'Manual THT Assembly', center: 'Line B', duration: 90 },
      { name: 'Functional Safety Test', center: 'QC Station 1', duration: 30 },
      { name: 'High Voltage Burn-in', center: 'Stress Testing Lab', duration: 480 },
      { name: 'Final Chassis Assembly', center: 'Line C', duration: 60 },
    ];

    for (let i = 0; i < activeProducts.length; i++) {
        const prod = activeProducts[i];
        const bomRef = `VOL-${(i + 1).toString().padStart(4, '0')}`; // 8 chars example: VOL-0001
        const createdBom = await tx.bOM.create({
          data: {
            reference: bomRef,
            productId: prod.id,
            versionNumber: prod.currentVersion,
            status: 'ACTIVE',
            createdById: users['arjun.mehta'].id,
            attachments: [`BOM-SCHEMATIC-${prod.name}.pdf`]
          }
        });

        // Add 6-10 components
        const componentCount = 6 + (i % 5);
        for (let c = 0; c < componentCount; c++) {
          const poolComp = componentsPool[c % componentsPool.length];
          await tx.bOMComponent.create({
            data: {
              bomId: createdBom.id,
              componentName: poolComp.name,
              quantity: (c + 1) * 2,
              makeOrBuy: poolComp.type,
              supplier: poolComp.type === 'BUY' ? poolComp.supplier : null,
              unitCost: poolComp.cost
            }
          });
        }

        // Add 4-6 operations
        const opCount = 4 + (i % 3);
        for (let o = 0; o < opCount; o++) {
          const poolOp = operationsPool[o % operationsPool.length];
          await tx.bOMOperation.create({
            data: {
              bomId: createdBom.id,
              operationName: poolOp.name,
              durationMins: poolOp.duration,
              workCenter: poolOp.center
            }
          });
        }
        boms.push(createdBom);
    }

    // ─── 7. SEED ECOS (30 ECOs) ───────────────────────────────────
    console.log('📝 Seeding ECOs and draft changes...');
    const statuses = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'APPLIED'];
    const reasons = ['COST_REDUCTION', 'QUALITY_ISSUE', 'CUSTOMER_DEMAND', 'REGULATORY', 'DESIGN_UPDATE'];
    const risks = ['HIGH', 'MEDIUM', 'LOW'];
    
    for (let i = 0; i < 30; i++) {
       const status = statuses[i % statuses.length];
       const reason = reasons[i % reasons.length];
       const risk = risks[i % risks.length];
       const creator = i % 2 === 0 ? users['arjun.mehta'] : users['priya.sharma'];
       const product = activeProducts[i % activeProducts.length];
       const bom = boms.find(b => b.productId === product.id) || null;
       
       const ecoStageMap = {
         'DRAFT': stages['Draft'],
         'IN_REVIEW': i % 2 === 0 ? stages['Engineering Review'] : stages['Quality Review'],
         'APPROVED': stages['Management Approval'],
         'REJECTED': stages['Draft'],
         'APPLIED': stages['Applied']
       };

       const eco = await tx.eCO.create({
         data: {
           reference: `ECO-2025-${(i + 1).toString().padStart(3, '0')}`,
           title: `${reason.replace('_', ' ')}: ${product.name} Optimization Phase ${i}`,
           ecoType: i % 3 === 0 ? 'PRODUCT' : 'BOM',
           productId: product.id,
           bomId: i % 3 === 0 ? null : (bom ? bom.id : null),
           userId: creator.id,
           changeReason: reason,
           riskLevel: risk,
           priority: risks[(i + 1) % 3],
           status: status,
           stageId: ecoStageMap[status].id,
           attachments: [`ECO-${i+1}-REV-A.pdf`, `REDLINE-${product.name}.dwg`],
           effectiveDate: status === 'APPLIED' ? new Date() : null,
         }
       });

       // Create Draft Changes for DRAFT ECOs
       if (status === 'DRAFT') {
         for (let d = 0; d < 3; d++) {
           await tx.eCODraftChange.create({
             data: {
               ecoId: eco.id,
               fieldName: d % 2 === 0 ? 'unitCost' : 'quantity',
               recordType: 'BOM_COMPONENT',
               recordId: 'COMP-123',
               oldValue: '100',
               newValue: '120'
             }
           });
         }
       }
    }

    // ─── 8. SEED AUDIT LOGS (30+ Logs) ────────────────────────────
    console.log('🎞️ Seeding audit logs...');
    for (let i = 0; i < 35; i++) {
      await tx.auditLog.create({
        data: {
          action: i % 2 === 0 ? 'ECO_STATUS_CHANGED' : 'BOM_VERSION_BUMP',
          recordType: i % 2 === 0 ? 'ECO' : 'BOM',
          recordId: 'EVENT-' + i,
          oldValue: 'INITIAL',
          newValue: 'UPDATED',
          userId: users['vikram.singh'].id,
          timestamp: new Date(Date.now() - (i * 3600000))
        }
      });
    }

    // ─── 9. SEED NOTIFICATIONS (15+ Notifications) ────────────────
    console.log('🔔 Seeding notifications...');
    const notificationReceivers = [users['rahul.nair'], users['ananya.iyer'], users['arjun.mehta']];
    for (let i = 0; i < 18; i++) {
      await tx.notification.create({
        data: {
          userId: notificationReceivers[i % notificationReceivers.length].id,
          message: i % 2 === 0 ? `New ECO raised for ${activeProducts[0].name}` : `ECO Approval required in ${targetStages[0]}`,
          link: `/ecos/detail-${i}`,
          isRead: i % 3 === 0,
          created_at: new Date(Date.now() - (i * 7200000))
        }
      });
    }

    console.log('🏁 Voltex Systems data seeded successfully!');
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
