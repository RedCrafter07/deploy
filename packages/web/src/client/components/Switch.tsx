import { useRef } from 'react';

type CheckboxProps = React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>;

export default function Switch(props: CheckboxProps & { label: string }) {
	const { label } = props;

	const checkbox = useRef<HTMLInputElement>(null);

	return (
		<div>
			<input type='checkbox' className='hidden' ref={checkbox} />

			<div
				className={`rounded-full w-14 h-8 ${
					checkbox.current?.checked ? 'bg-green-500' : 'bg-zinc-800'
				} flex items-center cursor-pointer transition-all duration-200`}
				onClick={() => {
					checkbox.current?.click();
				}}
			>
				<div
					className={`rounded-full w-6 h-6 bg-zinc-700 ${
						checkbox.current?.checked ? 'ml-6' : 'ml-1'
					} transition-all duration-200`}
				/>
			</div>

			<label className='ml-2'>{label}</label>
		</div>
	);
}
