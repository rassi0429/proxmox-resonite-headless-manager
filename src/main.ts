import axios from "axios";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const PROXMOX_HOST = 'https://192.168.10.81:8006';
const API_TOKEN = "root@pam!"
const TEMPLATE_ID = '9100';
const NODE_NAME = 'prox1';
const STORAGE = 'local';
const BRIDGE = 'vmbr0';

async function createServer() {
    const serverName = "testServer"
    const vmid = Math.floor(100 + Math.random() * 900);

    try {
        const cloneConfig: any = {
            method: 'post',
            url: `${PROXMOX_HOST}/api2/json/nodes/${NODE_NAME}/qemu/${TEMPLATE_ID}/clone`,
            headers: {
                'Authorization': `PVEAPIToken=${API_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: `newid=${vmid}&name=${serverName}&full=1`,
        };

        const cloneResponse = await axios(cloneConfig);
        console.log(cloneResponse.data);

        // VMの構成設定
        const config = {
            method: 'post',
            url: `${PROXMOX_HOST}/api2/json/nodes/${NODE_NAME}/qemu/${vmid}/config`,
            headers: {
                'Authorization': `PVEAPIToken=${API_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: `bootdisk=scsi0&scsi0=${STORAGE}:32&memory=2048&net0=virtio,bridge=${BRIDGE}&ostype=l26`,
        };

        const structureResponse = await axios(config);
        console.log('VM configuration set successfully.', structureResponse.data);


        // Cloud-Init設定
        const cloudInitConfig = {
            method: 'post',
            url: `${PROXMOX_HOST}/api2/json/nodes/${NODE_NAME}/qemu/${vmid}/config`,
            headers: {
                'Authorization': `PVEAPIToken=${API_TOKEN}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            data: 'ciuser=minecraft&cipassword=password&searchdomain=local&nameserver=8.8.8.8&ipconfig0=ip=dhcp',
        };

        await axios(cloudInitConfig);

        // サーバ起動
        const startConfig = {
            method: 'post',
            url: `${PROXMOX_HOST}/api2/json/nodes/${NODE_NAME}/qemu/${vmid}/status/start`,
            headers: {
                'Authorization': `PVEAPIToken=${API_TOKEN}`,
            },
        };

        await axios(startConfig);
        console.log(`Minecraft server ${serverName} created and started successfully.`);
    } catch (error) {
        console.error('Error creating server:', error);
    }
}

createServer();