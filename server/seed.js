import './config/env.js';
import User from './models/User.js';
import Site from './models/Site.js';
import Alarm from './models/Alarm.js';
import Commissioning from './models/Commissioning.js';
import Configuration from './models/Configuration.js';
import connectDB from './config/db.js';
import { ALARM_STATUS } from './utils/constants.js';

const seedData = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany({}),
      Site.deleteMany({}),
      Alarm.deleteMany({}),
      Commissioning.deleteMany({}),

      
      Configuration.deleteMany({})
    ]);

    const users = await User.create([
      { name: 'Admin User', email: 'admin@telecom.com', password: 'admin12345', role: 'Admin' },
      { name: 'Field Engineer', email: 'field@telecom.com', password: 'field12345', role: 'Field Engineer' },
      { name: 'NOC Engineer', email: 'noc@telecom.com', password: 'noc123456', role: 'NOC Engineer' },
      { name: 'Manager', email: 'manager@telecom.com', password: 'manager12345', role: 'Manager' }
    ]);

    const sites = await Site.create([
      {
        siteId: 'SITE001',
        location: { lat: 40.7128, lng: -74.006, address: 'New York, NY' },
        vendor: 'Ericsson',
        equipment: [
          { name: 'RRU', quantity: 3, installed: true },
          { name: 'BBU', quantity: 1, installed: true }
        ],
        installationStatus: 'In Progress',
        assignedEngineer: users[1]._id
      },
      {
        siteId: 'SITE002',
        location: { lat: 34.0522, lng: -118.2437, address: 'Los Angeles, CA' },
        vendor: 'Nokia',
        equipment: [
          { name: 'RRU', quantity: 3, installed: true },
          { name: 'BBU', quantity: 1, installed: true }
        ],
        installationStatus: 'Commissioned',
        assignedEngineer: users[1]._id
      }
    ]);

    await Alarm.create([
      {
        siteId: sites[0].siteId,
        alarmType: 'Power Failure',
        severity: 'Critical',
        status: ALARM_STATUS.OPEN,
        description: 'Main power supply failure detected'
      },
      {
        siteId: sites[1].siteId,
        alarmType: 'High Temperature',
        severity: 'Major',
        status: ALARM_STATUS.IN_PROGRESS,
        description: 'Equipment temperature exceeds threshold',
        assignedEngineer: users[2]._id
      }
    ]);

    await Commissioning.create({
      siteId: sites[1].siteId,
      engineer: users[1]._id,
      engineerName: users[1].name,
      checklist: [
        { key: 'powerVerification', label: 'Power verification', completed: true },
        { key: 'fiberConnectivity', label: 'Fiber connectivity', completed: true },
        { key: 'gpsSync', label: 'GPS sync', completed: true },
        { key: 'parameterConfiguration', label: 'Parameter configuration', completed: false },
        { key: 'acceptanceTest', label: 'Acceptance test', completed: false }
      ]
    });

    await Configuration.create({
      siteId: sites[0].siteId,
      version: 1,
      parameters: {
        ipAddress: '192.168.10.10',
        vlan: '100',
        frequency: '2100MHz',
        pci: '150',
        softwareVersion: 'v1.0.0'
      },
      updatedBy: users[1]._id,
      updatedAt: new Date(),
      isActive: true,
      changeReason: 'Initial load'
    });

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
