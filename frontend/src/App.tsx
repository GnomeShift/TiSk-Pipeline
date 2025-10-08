import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import TicketDetail from './components/TicketDetail';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<TicketList />} />
                    <Route path="create" element={<TicketForm />} />
                    <Route path="edit/:id" element={<TicketForm />} />
                    <Route path="ticket/:id" element={<TicketDetail />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;