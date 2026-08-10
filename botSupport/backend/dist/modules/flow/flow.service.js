import { flowRepository } from "./flow.repository.js";
export class FlowService {
    async getLatest() {
        return flowRepository.findLatest();
    }
    async update(data) {
        return flowRepository.upsert(data);
    }
}
export const flowService = new FlowService();
